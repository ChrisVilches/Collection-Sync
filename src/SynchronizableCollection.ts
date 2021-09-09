import SyncItem from "./SyncItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { SyncOptions, SyncConflictStrategy, SyncOperation } from "./types/SyncTypes";
import DocId from "./types/DocId";
import UpdateNewerItemError from "./exceptions/UpdateNewerItemError";
import Collection from "./Collection";
import CollectionSyncMetadata from "./CollectionSyncMetadata";
import * as R from "ramda";

// TODO: Many methods in this class could be private.

abstract class SynchronizableCollection implements Collection {
  protected readonly defaultSyncOptions: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  private _parent?: SynchronizableCollection;

  /** Used to keep state of sync process. */
  private lastSyncedItem?: SyncItem;

  public syncMetadata: CollectionSyncMetadata;

  constructor(syncMetadata: CollectionSyncMetadata){
    this.syncMetadata = syncMetadata;
  }

  abstract countAll(): number | Promise<number>;
  abstract findByIds(ids: DocId[]): SyncItem[] | Promise<SyncItem[]>;
  abstract syncBatch(items: SyncItem[]): SyncItem[] | Promise<SyncItem[]>;
  abstract itemsNewerThan(date: Date | undefined, limit: number): SyncItem[] | Promise<SyncItem[]>;
  abstract latestUpdatedItem(): SyncItem | Promise<SyncItem | undefined> | undefined;
  abstract initialize(): Promise<void>;

  /** Commits the sync operation. Database engines that don't support this should implement a method that
   * returns `true` (because the data was already added without the need for a commit statement). */
  abstract commitSync(): Promise<boolean> | boolean;

  // TODO: This method should be allowed to access data about how the sync went.
  /** Rollbacks the current data that's being synchronized. */
  rollbackSync(): Promise<void> | void{
  }

  // TODO: This method should be allowed to access data about how the sync went.
  /** Executed at the end of each sync operation (whether it succeeded or not). */
  cleanUp(): Promise<void> | void{
  }

  set parent(p: SynchronizableCollection | undefined){
    this._parent = p;
  }

  get parent(): SynchronizableCollection | undefined{
    return this._parent;
  }

  async needsSync(syncOperation: SyncOperation): Promise<boolean>{
    if(!this._parent) return false;

    const latestUpdatedItem = await (
      syncOperation == SyncOperation.Post ? this.latestUpdatedItem() : this._parent.latestUpdatedItem()
    );

    // No data to sync.
    if(latestUpdatedItem == null) return false;

    const lastAt = await this.syncMetadata.getLastAt(syncOperation);
    if(!lastAt) return true;
    return lastAt < latestUpdatedItem.updatedAt;
  }

  private async itemsToFetch(limit: number): Promise<SyncItem[]>{
    const lastFetchAt = await this.syncMetadata.getLastAt(SyncOperation.Fetch);
    return (this._parent as SynchronizableCollection).itemsNewerThan(lastFetchAt, limit);
  }

  private async itemsToPost(limit: number): Promise<SyncItem[]>{
    const lastPostAt = await this.syncMetadata.getLastAt(SyncOperation.Post);
    return await this.itemsNewerThan(lastPostAt, limit);
  }

  /** Gets list of items that can be synced (to either fetch or post). */
  async itemsToSync(syncOperation: SyncOperation, limit: number): Promise<SyncItem[]>{
    if(!this._parent){
      throw new ParentNotSetError("Cannot sync to parent");
    }

    if(!await this.needsSync(syncOperation)){
      return [];
    }

    switch(syncOperation){
      case SyncOperation.Fetch:
        return this.itemsToFetch(limit);
      case SyncOperation.Post:
        return this.itemsToPost(limit);
    }
  }

  async sync(syncOperation: SyncOperation, limit: number, options: SyncOptions = this.defaultSyncOptions){
    if(limit < 1){
      throw new Error("Limit must be a positive integer");
    }

    if(!this.needsSync(syncOperation)) return;
    const items: SyncItem[] = await this.itemsToSync(syncOperation, limit);

    let committed = false;

    try {
      await this.syncItems(items, syncOperation, options);
      committed = await this.commitSync();
    } finally {
      // By default rollback operation is triggered if it wasn't committed by the
      // end of the lifecycle (i.e. if commit returned false or .syncItems raised error).
      // TODO: WRONG!?!??! note that conflict exception would also execute a rollback.
      //       This probably shouldn't happen.
      //       However, we might want to change it so that all exceptions (including conflict)
      //       does a rollback = doesn't update lastSyncAt = has to do everything again.
      if(!committed){
        await this.rollbackSync();
      }

      if(committed && this.lastSyncedItem){
        await this.syncMetadata.setLastAt(this.lastSyncedItem.updatedAt, syncOperation);
      }

      await this.cleanUp();
    }
  }

  private areItemsSorted(items: SyncItem[]): boolean{
    if(items.length < 2) return true;
    let curr: SyncItem = items[0];

    for(let i=1; i<items.length; i++){
      if(curr.updatedAt > items[i].updatedAt) return false;
      curr = items[i];
    }

    return true;
  }

  // TODO: Simplify or split method into sub methods.
  async syncItems(items: SyncItem[], syncOperation: SyncOperation, options: SyncOptions): Promise<void>{
    if(!this.areItemsSorted(items)){
      throw new Error("Items to sync are not ordered correctly (order must be updatedAt ASC)");
    }

    this.lastSyncedItem = undefined;
    const parent: SynchronizableCollection = this.parent as SynchronizableCollection;
    const force = options.conflictStrategy == SyncConflictStrategy.Force;

    let compareObjects: {[key in DocId]: SyncItem} = {};

    switch(syncOperation){
      case SyncOperation.Fetch:
        compareObjects = R.indexBy(R.prop('id'), await this.findByIds(items.map(i => i.id)));
        break;
      case SyncOperation.Post:
        compareObjects = R.indexBy(R.prop('id'), await parent.findByIds(items.map(i => i.id)));
        break;
    }

    // Decide which object will have .syncBatch executed on.
    const upsertObject: SynchronizableCollection = syncOperation == SyncOperation.Fetch ? this : parent;

    const cleanItems: SyncItem[] = [];

    let conflictItem: SyncItem | undefined = undefined;

    let lastIgnoredItem: SyncItem | undefined = undefined;

    for(let i=0; i<items.length; i++){
      const objectToCompare = compareObjects[items[i].id];

      // TODO: This lastSync was already fetched somewhere in the sync process. Reuse that value instead of fetching it again.
      const lastSync: Date | undefined = await this.syncMetadata.getLastAt(syncOperation);
      const conflict = lastSync && objectToCompare?.updatedAt > lastSync;

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
      } else if(options.conflictStrategy == SyncConflictStrategy.RaiseError) {
        conflictItem = items[i];

        // Abort when first conflict is encountered.
        break;
      } else if(options.conflictStrategy == SyncConflictStrategy.Ignore) {
        lastIgnoredItem = items[i];
      }
    }

    // TODO: (Improvement) Make a "commit" abstract method. It's executed during the sync lifecycle (at the end).
    //       The method will depend on implementation, but some users might want to have such a feature to only
    //       commit changes when this method is executed (users define their own code).
    //       If this is implemented, then also implement pre-commit and post-commit hooks.
    //
    //       Commit should also return a value (which is finally mapped to either success or fail).
    //
    //       Note that if the data is not yet committed, it means it's stored in some kind of temporary datastore,
    //       which means it needs to be cleaned up somehow. This is why hooks like "finally/cleanup" and initialization (pre-upsert is probably ok
    //       but consider renaming it to make it more generic) would be useful.
    //
    //       At any rate, all of this is implemented by the user, so if their DB engines don't support all this stuff, they just leave the methods blank.
    //       And I don't really have to implement them, but it'd be useful to test that it works all OK (proof of concept).
    //
    //       Also, since the code would get really complex with all of these improvements, it'd be cool to create some kind of diagram to summarize everything.

    let upsertedItems: SyncItem[] = [];

    if(cleanItems.length > 0){
      try {
        // TODO: (Improvement) Pre-sync hook (as arguments, give them some info like the items to sync, etc).
        upsertedItems = await upsertObject.syncBatch(cleanItems);
        // TODO: (Improvement) Post-sync hook.
        //
        //       Note that hooks should prevent further execution if they signal or return some value.
        //       For example, in RoR it happens when a filter returns false.
      } catch(e){
        // TODO: (Improvement) Even after this error, it'd be great to know the status of the sync.
        //       This feature is commented below as well. Maybe it'd be necessary to return something
        //       like a "sync status object" (create interface) which contains all data, including if
        //       there's an error. In fact, the error object could be inside that status object as well.
        //       If the database engine used doesn't return the upserted count, then allow undefined for that number.

        // It's necessary to unset this variable so that the next sync is done from scratch again.
        // syncBatch isn't necessarily sorted by updatedAt, this is because sometimes the sync operation would need to split
        // the "delete" and "update" actions into two lists, and execute them individually.
        // Only for the conflict exception it's safe to leave the progress (without having to redo it) because the safe to sync item list
        // and the existence of a conflict were determined beforehand.
        this.lastSyncedItem = undefined; // TODO: Test.
        throw new Error("Sync (upsert/delete) batch operation failed");
      }
    }

    // Get last object. Set it after the upsert has completed without errors.
    // Otherwise, if upsert failed, the value would be set (and therefore set the last sync date
    // using that object, even if it failed).
    this.lastSyncedItem = (
      // In case there was an ignored item, add it to the array to compute last sync date.
      lastIgnoredItem ? upsertedItems.concat([lastIgnoredItem]) : upsertedItems
    ).concat().sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))[0];

    // TODO: (Improvement) make it possible to get the status of the sync operation.
    //       This means that even if an error occurred, be able to fetch which records were synced, which
    //       ones weren't synced, which ones where ignored, etc.

    if(conflictItem){
      throw new UpdateNewerItemError(conflictItem.id);
    }
  }
}

export default SynchronizableCollection;
