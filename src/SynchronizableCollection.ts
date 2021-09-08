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

  // TODO: Make sure items are in updatedAt order. Or implement something that ensures it,
  //       and/or throws an error if it detects its not sorted. This is because the algorithm
  //       would stop when it encounters a conflict, having updated everything with a updatedAt
  //       lower than the current element, possibly modifying the lastSyncAt to that point in time.
  //       (So that the items prior to the conflict are not synced again).
  //
  //       Code that checks this should be in the non-extendable part (not user defined classes).
  private async itemsToFetch(): Promise<CollectionItem[]>{
    const lastFetchAt = await this.syncMetadata.getLastAt(SyncOperation.Fetch);
    return (this._parent as SynchronizableCollection).itemsNewerThan(lastFetchAt);
  }

  private async itemsToPost(): Promise<CollectionItem[]>{
    const lastPostAt = await this.syncMetadata.getLastAt(SyncOperation.Post);
    return await this.itemsNewerThan(lastPostAt);
  }

  // TODO: Should be private?
  // TODO: Note that this comment will be invisible for users implementing this class.
  //       Users need to pay attention to this warning when implementing a Collection.
  /** Returns a list of items to sync. The list MUST be ordered by updatedAt ASC.
   * Failing to provide an `order by updatedAt ASC` list will corrupt in case
   * of conflict error (if it's ordered, a conflict would safely abort the sync process).
  */
  async itemsToSync(syncOperation: SyncOperation): Promise<CollectionItem[]>{
    if(!this._parent){
      throw new ParentNotSetError("Cannot sync to parent");
    }

    if(!await this.needsSync(syncOperation)){
      return [];
    }

    switch(syncOperation){
      case SyncOperation.Fetch:
        return this.itemsToFetch();
      case SyncOperation.Post:
        return this.itemsToPost();
    }
  }

  async sync(syncOperation: SyncOperation, options: SyncOptions = this.defaultSyncOptions){
    if(!this.needsSync(syncOperation)) return;
    const items: CollectionItem[] = await this.itemsToSync(syncOperation);

    try {
      await this.syncItems(items, syncOperation, options);
    } finally {
      if(this.lastSyncedItem){
        await this.syncMetadata.setLastAt(this.lastSyncedItem.updatedAt, syncOperation);
      }
    }
  }

  async syncItems(items: CollectionItem[], syncOperation: SyncOperation, options: SyncOptions): Promise<void>{
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

    let upsertedItems: CollectionItem[] = [];

    if(cleanItems.length > 0){
      upsertedItems = await upsertObject.upsertBatch(cleanItems);
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

    if(conflictItem){
      throw new UpdateNewerItemError(conflictItem.id);
    }
  }
}

export default SynchronizableCollection;
