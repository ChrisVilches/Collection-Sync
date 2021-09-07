import CollectionItem from "./CollectionItem";

abstract class SynchronizableCollection {
  private _parent?: SynchronizableCollection;

  // Stores the last time it was synced with the parent node.
  // If the collection is a root node, then this should be undefined.
  private _lastSyncAt?: Date; // TODO: Turn into an abstract method?
  
  constructor() {
  }

  // TODO: This date should be set internally.
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

    const lastParentUpdate = this._parent.lastUpdateAt();

    if(lastParentUpdate == null) return false;

    if(!this._lastSyncAt) return true;

    return this._lastSyncAt < lastParentUpdate;
  }

  itemsToFetchFromParent(): CollectionItem[]{
    if(this._parent == undefined){
      throw new Error("Cannot fetch from parent because node is root");
    }

    if(!this.needsFetchFromParent()){
      return [];
    }

    return (this._parent as SynchronizableCollection).itemsNewerThan(this._lastSyncAt);
  }

  abstract updateFromParent(): void;

  abstract itemsNewerThan(date: Date | undefined): CollectionItem[];

  abstract countAll(): number;

  abstract findAll(): any;

  abstract lastUpdateAt(): Date | null;
}

export default SynchronizableCollection;
