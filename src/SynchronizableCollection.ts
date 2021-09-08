import CollectionItem from "./CollectionItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { SyncOptions, SyncConflictStrategy, SyncOperation } from "./types/SyncTypes";
import UpdateNewerItemError from "./exceptions/UpdateNewerItemError";
import Collection from "./Collection";
import CollectionSyncMetadata from "./CollectionSyncMetadata";

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

  async syncItems(items: CollectionItem[], syncOperation: SyncOperation, options: SyncOptions){
    this.lastSyncedItem = undefined;

    for(let i=0; i<items.length; i++){
      const item = items[i];
      let found: CollectionItem | undefined;
      const parent: SynchronizableCollection = this.parent as SynchronizableCollection;

      if(syncOperation == SyncOperation.Fetch){
        found = await this.findById(item.id);
      } else {
        found = await parent.findById(item.id);
      }

      const upsertObject: any = syncOperation == SyncOperation.Fetch ? this : parent;
      const conflict = found && found.updatedAt > item.updatedAt;
      const force = options.conflictStrategy == SyncConflictStrategy.Force;

      if(force || !conflict){
        upsertObject.upsertBatch([item]);
      } else if(options.conflictStrategy == SyncConflictStrategy.RaiseError) {
        throw new UpdateNewerItemError(item.id);
      }

      this.lastSyncedItem = item;
    }
  }
}

export default SynchronizableCollection;
