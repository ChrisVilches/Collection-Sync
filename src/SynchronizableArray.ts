import CollectionItem from "./CollectionItem";
import SynchronizableCollection from "./SynchronizableCollection";
import UpdateNewerItemError from "./exceptions/UpdateNewerItemError";
import { SyncOptions, SyncConflictStrategy } from "./types/SyncTypes";
import DocId from "./types/DocId";
import { List } from "immutable";

class SynchronizableArray extends SynchronizableCollection{
  array: CollectionItem[];

  constructor(array: CollectionItem[]){
    super();
    this.array = List(array).toArray(); // It seems R.clone doesn't work for cloning (several tests fail).
  }

  itemsNewerThan(date: Date | undefined): CollectionItem[]{
    if(date == undefined){
      return this.array;
    }
    return this.array.sort((a: CollectionItem, b: CollectionItem) => (a.updatedAt as any) - (b.updatedAt as any))
                     .filter(item => date < item.updatedAt);
  }

  findById(id: DocId): CollectionItem | undefined{
    return this.array.find((x: CollectionItem) => x.id == id);
  }

  upsert(item: CollectionItem){
    const found: CollectionItem | undefined = this.findById(item.id);
    if(found){
      found.update(item.document, item.updatedAt, item.deleted);
      return found;
    } else {
      this.array.push(item);
      return item;
    }
  }

  // TODO: Some of this code/logic should be in the base class.
  updateFromParent(options: SyncOptions = this.defaultSyncOptions){
    if(!this.needsFetchFromParent()) return;

    const items: CollectionItem[] = this.itemsToFetchFromParent();

    for(let i=0; i<items.length; i++){
      const item = items[i];
      const id = item.id;

      const found: CollectionItem | undefined = this.findById(id);

      if(found && found.updatedAt > item.updatedAt){
        if(options.conflictStrategy == SyncConflictStrategy.RaiseError){
          throw new UpdateNewerItemError(item.id);
        } else if(options.conflictStrategy == SyncConflictStrategy.Force) {
          this.upsert(item);
        }
      } else {
        this.upsert(item);
      }

      this.lastFetchAt = item.updatedAt;
    }
  }

  updateParent(options: SyncOptions = this.defaultSyncOptions){
    if(!this.needsToUpdateParent()) return;

    const items: CollectionItem[] = this.itemsToUpdateParent();
    const parent: SynchronizableCollection = this.parent as SynchronizableCollection;

    for(let i=0; i<items.length; i++){
      const item = items[i];
      const id = item.id;

      const found: CollectionItem | undefined = (this.parent as SynchronizableArray).findById(id);

      if(found && found.updatedAt > item.updatedAt){
        if(options.conflictStrategy == SyncConflictStrategy.RaiseError){
          throw new UpdateNewerItemError(item.id);
        } else if(options.conflictStrategy == SyncConflictStrategy.Force){
          parent.upsert(item);
        }
      } else {
        parent.upsert(item);
      }

      this.lastPostAt = item.updatedAt;
    }
  }

  latestUpdateAt(): Date | null{
    if(this.array.length == 0) return null;

    let latest = this.array[0].updatedAt;

    for(let i=0; i<this.array.length; i++){
      let curr = this.array[i].updatedAt;
      if(latest < curr){
        latest = curr;
      }
    }

    return latest;
  }
}

export default SynchronizableArray;
