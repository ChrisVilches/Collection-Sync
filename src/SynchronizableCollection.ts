import CollectionItem from "./CollectionItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { UpdateFromParentOptions, UpdateFromParentConflictStrategy } from "./types/UpdateFromParent";

abstract class SynchronizableCollection {
  protected readonly defaultUpdateFromParentOptions: UpdateFromParentOptions = {
    conflictStrategy: UpdateFromParentConflictStrategy.RaiseError
  };

  private _parent?: SynchronizableCollection;

  // Stores the last time it was synced with the parent node.
  // If the collection is a root node, then this should be undefined.
  private _lastSyncAt?: Date; // TODO: Turn into an abstract method?

  // TODO: This date should be set internally (i.e. set as private or protected).
  set lastSyncAt(d : Date){
    this._lastSyncAt = d;
  }

  set parent(p: SynchronizableCollection | undefined){
    this._parent = p;
  }

  get parent(): SynchronizableCollection | undefined{
    return this._parent;
  }

  // TODO: Eventually needs to support async/await.
  needsFetchFromParent(): boolean{
    if(!this._parent) return false;

    const lastParentUpdate = this._parent.latestUpdateAt();

    if(lastParentUpdate == null) return false;

    if(!this._lastSyncAt) return true;

    return this._lastSyncAt < lastParentUpdate;
  }

  // TODO: Make sure items are in updatedAt order. Or implement something that ensures it,
  //       and/or throws an error if it detects its not sorted. This is because the algorithm
  //       would stop when it encounters a conflict, having updated everything with a updatedAt
  //       lower than the current element, possibly modifying the lastSyncAt to that point in time.
  //       (So that the items prior to the conflict are not synced again).
  //
  //       Code that checks this should be in the non-extendable part (not user defined classes).
  itemsToFetchFromParent(): CollectionItem[]{
    if(this._parent == undefined){
      throw new ParentNotSetError("Cannot fetch from parent");
    }

    if(!this.needsFetchFromParent()){
      return [];
    }

    return (this._parent as SynchronizableCollection).itemsNewerThan(this._lastSyncAt);
  }

  abstract upsert(item: CollectionItem): CollectionItem;

  abstract updateFromParent(): void;

  abstract itemsNewerThan(date: Date | undefined): CollectionItem[];

  /**
  * Gets the highest `updateAt` date in the collection.
  */
  abstract latestUpdateAt(): Date | null;
}

export default SynchronizableCollection;
