import SyncItem from "./SyncItem";
import SynchronizableCollection from "./SynchronizableCollection";
import Collection from "./Collection";
import { SyncConflictStrategy, SyncOperation, SyncOptions } from "./types/SyncTypes";
import DocId from "./types/DocId";
import * as R from "ramda";
import SyncStatus from "./types/SyncStatus";

// TODO: (Improvement) make it possible to get the status of the sync operation.
//       This means that even if an error occurred, be able to fetch which records were synced, which
//       ones weren't synced, which ones where ignored, etc.
class Synchronizer{
  private _startDate: Date;
  private _endDate?: Date;

  /** Used to keep state of sync process. */
  private lastSyncedItem?: SyncItem;

  /** Used to store first conflict detected while syncing. */
  private _conflictItem?: SyncItem;

  // TODO: Implement. And implement similar stats like this too.
  private _syncedCount: number = 0;
  private _ignoredCount: number = 0;

  private _syncStatus: SyncStatus = SyncStatus.NotStarted;

  private destCollection: Collection;
  private committed: boolean = false;
  private _rollbacked: boolean = false;

  get rollbacked(): boolean{
    return this._rollbacked;
  }

  get successfullyCommitted(): boolean{
    return this.committed;
  }

  get syncStatus(): SyncStatus{
    return this._syncStatus;
  }

  get startDate(): Date{
    return this._startDate;
  }

  get endDate(): Date | undefined{
    return this._endDate;
  }

  get lastUpdatedAt(): Date | undefined{
    return this.lastSyncedItem?.updatedAt;
  }

  get conflictItem(): SyncItem | undefined{
    return this._conflictItem;
  }

  constructor(destCollection: Collection){
    this._startDate = new Date();
    this.destCollection = destCollection;
  }

  /** This method can only be executed once. In order to sync again, create a new instance. */
  async executeSync(lastSyncAt: Date | undefined, items: SyncItem[], options: SyncOptions){
    if(this.syncStatus != SyncStatus.NotStarted){
      throw new Error("Cannot execute sync again");
    }

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

  async commit(){
    await this.retryUntilSuccess(
      5,
      async () => await this.destCollection.commitSync(11111111),
      (result: any) => this.committed = result
    );

    // No longer needed to hold some data since it finished.
    this.cleanUp();
  }

  async rollback(){
    await this.retryUntilSuccess(
      5,
      async () => await this.destCollection.rollbackSync(11111111),
      () => this._rollbacked = true
    );

    // No longer needed to hold some data since it finished.
    this.cleanUp();
  }

  /**
   * Retries a function N times until it succeeds. If it doesn't succeed, it
   * raises a fatal unrecoverable error.
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
      throw err;
    }
  }

  // TODO: Extremely high cyclomatic complexity. Refactor.
  private async syncItems(lastSyncAt: Date | undefined, items: SyncItem[], options: SyncOptions): Promise<void>{
    const force = options.conflictStrategy == SyncConflictStrategy.Force;

    let compareObjects: {[key in DocId]: SyncItem} = {};

    compareObjects = R.indexBy(R.prop('id'), await this.destCollection.findByIds(items.map(i => i.id)));

    const cleanItems: SyncItem[] = [];

    let lastIgnoredItem: SyncItem | undefined = undefined;

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

      if(force || !conflict){
        cleanItems.push(items[i]);
      } else if(conflict) {
        // Store first conflict.
        this._conflictItem ||= items[i];

        if(options.conflictStrategy == SyncConflictStrategy.Ignore){
          lastIgnoredItem = items[i];
        } else {
          break;
        }
      }
    }

    let syncedItems: SyncItem[] = [];

    if(cleanItems.length == 0)
      this._syncStatus = SyncStatus.Success;
    else if(cleanItems.length > 0){
      try {
        syncedItems = await this.destCollection.syncBatch(cleanItems);
        this._syncStatus = SyncStatus.Success;
      } catch(e){
        this._syncStatus = SyncStatus.UnexpectedError;
      }
    }

    // Get the highest updateAt, from the synced items + the ignored items.
    this.lastSyncedItem = this.itemHighestUpdatedAt(syncedItems.concat([lastIgnoredItem as any]));

    if(this._conflictItem){
      if(options.conflictStrategy == SyncConflictStrategy.RaiseError){
        this._syncStatus = SyncStatus.Conflict;
      } else if(options.conflictStrategy == SyncConflictStrategy.SyncUntilConflict){
        this._syncStatus = SyncStatus.SuccessPartial;
      }
    }
  }

  abort(){
    this._syncStatus = SyncStatus.Aborted;
  }

  private itemHighestUpdatedAt(items: (SyncItem | undefined)[]): SyncItem | undefined{
    // Remove undefined values.
    const compact: SyncItem[] = items.filter(x => x) as SyncItem[];
    if(compact.length == 0) return undefined;

    let highest = compact[0];

    for(let i=1; i<compact.length; i++){
      const curr = compact[i];
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
