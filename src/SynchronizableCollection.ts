import CollectionItem from "./CollectionItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { SyncOptions, SyncConflictStrategy, SyncOperation } from "./types/SyncTypes";
import DocId from "./types/DocId";
import UpdateNewerItemError from "./exceptions/UpdateNewerItemError";
import Collection from "./Collection";
import CollectionSyncMetadata from "./CollectionSyncMetadata";
import * as R from "ramda";

// TODO: Many methods in this class could be private.

abstract class SynchronizableCollection extends Collection {
  protected readonly defaultSyncOptions: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  private _parent?: SynchronizableCollection;

  /** Used to keep state of sync process. */
  private lastSyncedItem?: CollectionItem;

  public syncMetadata: CollectionSyncMetadata;

  constructor(syncMetadata: CollectionSyncMetadata){
    super();
    this.syncMetadata = syncMetadata;
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

  private async itemsToFetch(limit: number): Promise<CollectionItem[]>{
    const lastFetchAt = await this.syncMetadata.getLastAt(SyncOperation.Fetch);
    return (this._parent as SynchronizableCollection).itemsNewerThan(lastFetchAt, limit);
  }

  private async itemsToPost(limit: number): Promise<CollectionItem[]>{
    const lastPostAt = await this.syncMetadata.getLastAt(SyncOperation.Post);
    return await this.itemsNewerThan(lastPostAt, limit);
  }

  /** Gets list of items that can be synced (to either fetch or post). */
  async itemsToSync(syncOperation: SyncOperation, limit: number): Promise<CollectionItem[]>{
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
    const items: CollectionItem[] = await this.itemsToSync(syncOperation, limit);

    try {
      await this.syncItems(items, syncOperation, options);
    } finally {
      if(this.lastSyncedItem){
        await this.syncMetadata.setLastAt(this.lastSyncedItem.updatedAt, syncOperation);
      }
    }
  }

  private areItemsSorted(items: CollectionItem[]): boolean{
    if(items.length < 2) return true;
    let curr: CollectionItem = items[0];

    for(let i=1; i<items.length; i++){
      if(curr.updatedAt > items[i].updatedAt) return false;
      curr = items[i];
    }

    return true;
  }

  async syncItems(items: CollectionItem[], syncOperation: SyncOperation, options: SyncOptions): Promise<void>{
    if(!this.areItemsSorted(items)){
      throw new Error("Items to sync are not ordered correctly (order must be updatedAt ASC)");
    }

    this.lastSyncedItem = undefined;
    const parent: SynchronizableCollection = this.parent as SynchronizableCollection;
    const force = options.conflictStrategy == SyncConflictStrategy.Force;

    let compareObjects: {[key: DocId]: CollectionItem} = {};

    switch(syncOperation){
      case SyncOperation.Fetch:
        compareObjects = R.indexBy(R.prop('id'), await this.findByIds(items.map(i => i.id)));
        break;
      case SyncOperation.Post:
        compareObjects = R.indexBy(R.prop('id'), await parent.findByIds(items.map(i => i.id)));
        break;
    }

    // Decide which object will have .upsertBatch executed on.
    const upsertObject: SynchronizableCollection = syncOperation == SyncOperation.Fetch ? this : parent;

    const cleanItems: CollectionItem[] = [];

    let conflictItem: CollectionItem | undefined = undefined;

    let lastIgnoredItem: CollectionItem | undefined = undefined;

    for(let i=0; i<items.length; i++){
      const objectToCompare = compareObjects[items[i].id];
      const conflict = objectToCompare?.updatedAt > items[i].updatedAt;

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

    let upsertedItems: CollectionItem[] = [];

    if(cleanItems.length > 0){
      try {
        // TODO: (Improvement) Pre-sync hook (as arguments, give them some info like the items to sync, etc).
        upsertedItems = await upsertObject.upsertBatch(cleanItems);
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
        throw new Error("Upsert batch operation failed");
      }
    }

    // Get last object. Set it after the upsert has completed without errors.
    // Otherwise, if upsert failed, the value would be set (and therefore set the last sync date
    // using that object, even if it failed).
    let lastUpsertedItem: CollectionItem | undefined = upsertedItems[upsertedItems.length - 1];
    this.lastSyncedItem = lastUpsertedItem;

    // However, if one item was ignored (using ignore policy), and if that one is the latest one
    // in the batch, then use that one to set the last sync date.
    if(lastIgnoredItem){
      if(!lastUpsertedItem || (lastIgnoredItem.updatedAt > lastUpsertedItem.updatedAt)){
        this.lastSyncedItem = lastIgnoredItem;
      }
    }

    // TODO: (Improvement) make it possible to get the status of the sync operation.
    //       This means that even if an error occurred, be able to fetch which records were synced, which
    //       ones weren't synced, which ones where ignored, etc.

    if(conflictItem){
      throw new UpdateNewerItemError(conflictItem.id);
    }
  }
}

export default SynchronizableCollection;
