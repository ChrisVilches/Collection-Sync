import CollectionItem from "./CollectionItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { SyncOptions, SyncConflictStrategy, SyncOperation } from "./types/SyncTypes";
import UpdateNewerItemError from "./exceptions/UpdateNewerItemError";
import Collection from "./Collection";

abstract class SynchronizableCollection extends Collection {
  protected readonly defaultSyncOptions: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  private _parent?: SynchronizableCollection;

  // Stores the last time it was synced with the parent node.
  // If the collection is a root node, then this should be undefined.
  private _lastFetchAt?: Date; // TODO: Turn into an abstract method?
  private _lastPostAt?: Date;

  // TODO: This date should be set internally (i.e. set as private or protected).
  set lastFetchAt(d : Date){
    this._lastFetchAt = d;
  }

  set lastPostAt(d : Date){
    this._lastPostAt = d;
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

    switch(syncOperation){
      case SyncOperation.Post:
        if(!this._lastPostAt) return true;
        return this._lastPostAt < latestUpdatedItem.updatedAt;
      case SyncOperation.Fetch:
        if(!this._lastFetchAt) return true;
        return this._lastFetchAt < latestUpdatedItem.updatedAt;
    }
  }

  // TODO: Make sure items are in updatedAt order. Or implement something that ensures it,
  //       and/or throws an error if it detects its not sorted. This is because the algorithm
  //       would stop when it encounters a conflict, having updated everything with a updatedAt
  //       lower than the current element, possibly modifying the lastSyncAt to that point in time.
  //       (So that the items prior to the conflict are not synced again).
  //
  //       Code that checks this should be in the non-extendable part (not user defined classes).
  async itemsToFetchFromParent(): Promise<CollectionItem[]>{
    if(this._parent == undefined){
      throw new ParentNotSetError("Cannot fetch from parent");
    }

    if(!await this.needsSync(SyncOperation.Fetch)){
      return [];
    }

    return (this._parent as SynchronizableCollection).itemsNewerThan(this._lastFetchAt);
  }

  async itemsToPost(): Promise<CollectionItem[]>{
    if(this._parent == undefined){
      throw new ParentNotSetError("Cannot post to parent");
    }

    if(!await this.needsSync(SyncOperation.Post)){
      return [];
    }

    return await this.itemsNewerThan(this._lastPostAt);
  }

  async fetch(options: SyncOptions = this.defaultSyncOptions){
    if(!this.needsSync(SyncOperation.Fetch)) return;
    const items: CollectionItem[] = await this.itemsToFetchFromParent();
    await this.syncItems(items, SyncOperation.Fetch, options);
  }

  async post(options: SyncOptions = this.defaultSyncOptions){
    if(!this.needsSync(SyncOperation.Post)) return;
    const items: CollectionItem[] = await this.itemsToPost();
    await this.syncItems(items, SyncOperation.Post, options);
  }

  async syncItems(items: CollectionItem[], syncOperation: SyncOperation, options: SyncOptions){
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
        upsertObject.upsert(item);
      } else if(options.conflictStrategy == SyncConflictStrategy.RaiseError) {
        throw new UpdateNewerItemError(item.id);
      }

      if(syncOperation == SyncOperation.Fetch){
        this.lastFetchAt = item.updatedAt;
      } else {
        this.lastPostAt = item.updatedAt;
      }
    }
  }
}

export default SynchronizableCollection;
