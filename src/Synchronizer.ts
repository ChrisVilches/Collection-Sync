import SyncItem from "./SyncItem";
import Collection from "./Collection";
import { SyncConflictStrategy, SyncOperation, SyncOptions } from "./types/SyncTypes";
import DocId from "./types/DocId";
import * as R from "ramda";
import SyncStatus from "./types/SyncStatus";

class Synchronizer{
  /** Used to keep state of sync process. */
  private lastSyncedItem?: SyncItem;

  // Currently not used, so this can wait for a future version.
  private _startDate?: Date;
  private _endDate?: Date;

  /** List of filtered items (removing conflicts, etc) that actually get sent to the destination collection for syncing. */
  private _itemsToSync: SyncItem[] = [];
  private _ignoredItems: SyncItem[] = []
  private _conflictItems: SyncItem[] = [];

  private _syncStatus: SyncStatus = SyncStatus.NotStarted;

  private destCollection: Collection;
  private committed: boolean = false;
  private _rollbacked: boolean = false;

  get successfullyRollbacked(): boolean{
    return this._rollbacked;
  }

  get successfullyCommitted(): boolean{
    return this.committed;
  }

  get syncStatus(): SyncStatus{
    return this._syncStatus;
  }

  get lastUpdatedAt(): Date | undefined{
    return this.lastSyncedItem?.updatedAt;
  }

  get itemsToSync(): SyncItem[]{
    return this._itemsToSync;
  }

  get conflictItems(): SyncItem[]{
    return this._conflictItems;
  }

  get ignoredItems(): SyncItem[]{
    return this._ignoredItems;
  }

  constructor(destCollection: Collection){
    this.destCollection = destCollection;
  }

  /**
   * This method sends the data to the destination collection.
   * It throws no exception related to WRITE/DELETE database operations.
   * READ operations used inside this method might fail, as well as errors due to wrong
   * arguments, but when a WRITE/DELETE fails, it sets the status accordingly for further inspection,
   * and does not throw any error.
   * This method can only be executed once. In order to sync again, create a new instance.
  */
  async executeSync(lastSyncAt: Date | undefined, items: SyncItem[], options: SyncOptions){
    if(this._syncStatus != SyncStatus.NotStarted){
      throw new Error("Cannot execute sync again");
    }

    if(items.length == 0){
      this._syncStatus = SyncStatus.PreCommitDataTransmittedSuccessfully;
      return;
    }

    this._syncStatus = SyncStatus.Running;

    if(!this.areItemsSorted(items)){
      throw new Error("Items to sync are not ordered correctly (order must be updatedAt ASC)");
    }

    await this.syncItems(lastSyncAt, items, options);
  }

  private cleanUp(){
    // Free memory after using it.
    
    // TODO: Do this micro optimization.
    //this.destCollection = undefined;
  }

  /** Executes a commit. If it does not succeed, status is set to `SyncStatus.UnexpectedError`. */
  async commit(){
    await this.retryUntilSuccess(
      5,
      async () => await this.destCollection.commitSync(this._itemsToSync, this._ignoredItems, this._conflictItems),
      (result: any) => this.committed = result
    );

    // No longer needed to hold some data since it finished.
    this.cleanUp();
  }

  /** Executes a rollback. If it does not succeed, status is set to `SyncStatus.UnexpectedError`. */
  async rollback(){
    await this.retryUntilSuccess(
      5,
      async () => await this.destCollection.rollbackSync(this._itemsToSync, this._ignoredItems, this._conflictItems),
      () => this._rollbacked = true
    );

    // No longer needed to hold some data since it finished.
    this.cleanUp();
  }

  /**
   * Retries a function N times until it succeeds. If it doesn't succeed, it sets
   * the status to error.
   */
  private async retryUntilSuccess(times: number = 1, cb: Function, onSuccess: Function){
    let err;
    let result;
    for(let i=0; i<times; i++){
      try {
        err = undefined;
        result = await cb();
        break;
      } catch(e){
        err = e;
      }
    }

    await onSuccess(result);

    if(err){
      this._syncStatus = SyncStatus.UnexpectedError;
    }
  }

  // TODO: Extremely high cyclomatic complexity. Refactor.
  private async syncItems(lastSyncAt: Date | undefined, items: SyncItem[], options: SyncOptions): Promise<void>{
    const force = options.conflictStrategy == SyncConflictStrategy.Force;

    let compareObjects: {[key in DocId]: SyncItem} = {};

    compareObjects = R.indexBy(R.prop('id'), await this.destCollection.findByIds(items.map(i => i.id)));

    /**
     * This is to stop adding items to sync after a conflict (with raise error flag) has been found.
     * If conflicts are ignored, this doesn't do anything.
    */
    let stopAdding = false;

    for(let i=0; i<items.length; i++){
      const objectToCompare = compareObjects[items[i].id];
      const conflict = lastSyncAt && objectToCompare?.updatedAt > lastSyncAt;

      // TODO: The line above used to be:
      //       objectToCompare?.updatedAt > items[i].updatedAt;
      //       However when changing it (fixed logic error) the tests don't throw anything. This means the test cases are poor.
      //
      //       The fix above was made because the previous logic was "your item is newer than mine", but instead it should be
      //       "both items have been modified since the last time I synced", which is what that line does now (fixed, but untested).
      //
      //       Also new conflict strategies can be introduced, such as "Force if newer", "Raise error if older" or something like that.

      if((force || !conflict) && !stopAdding){
        this._itemsToSync.push(items[i]);
      } else if(conflict) {
        this._conflictItems.push(items[i]);

        if(options.conflictStrategy == SyncConflictStrategy.Ignore){
          this._ignoredItems.push(items[i]);
        } else {
          stopAdding = true;
        }
      }
    }

    if(this._conflictItems.length > 0 && options.conflictStrategy == SyncConflictStrategy.RaiseError){
      this._syncStatus = SyncStatus.Conflict;
      return;
    }

    let syncedItems: SyncItem[] = [];

    if(this._itemsToSync.length == 0)
      this._syncStatus = SyncStatus.PreCommitDataTransmittedSuccessfully;
    else if(this._itemsToSync.length > 0){
      try {
        syncedItems = await this.destCollection.syncBatch(this._itemsToSync);
        this._syncStatus = SyncStatus.PreCommitDataTransmittedSuccessfully;
      } catch(e){
        this._syncStatus = SyncStatus.UnexpectedError;
        return;
      }
    }

    // Get the highest updateAt, from the synced items + the ignored items.
    this.lastSyncedItem = this.itemHighestUpdatedAt(syncedItems.concat(this._ignoredItems));
  }

  abort(){
    this._syncStatus = SyncStatus.Aborted;
  }

  private itemHighestUpdatedAt(items: SyncItem[]): SyncItem | undefined{
    if(items.length == 0) return undefined;

    let highest = items[0];

    for(let i=1; i<items.length; i++){
      const curr = items[i];
      if(highest.updatedAt < curr.updatedAt){
        highest = curr;
      }
    }

    return highest;
  }

  private areItemsSorted(items: SyncItem[]): boolean {
    if(items.length < 2) return true;

    for(let i=1; i<items.length; i++){
      const prev = items[i - 1];
      const curr = items[i];

      if(prev.updatedAt > curr.updatedAt) return false;
    }

    return true;
  }
}

export default Synchronizer;
