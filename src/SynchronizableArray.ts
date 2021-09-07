import CollectionItem from "./CollectionItem";
import SynchronizableCollection from "./SynchronizableCollection";
import LocalItemNewerThanParentItemError from "./exceptions/LocalItemNewerThanParentItemError";
import { UpdateFromParentOptions, UpdateFromParentConflictStrategy } from "./types/UpdateFromParent";
import DocId from "./types/DocId";

class SynchronizableArray extends SynchronizableCollection{
  array: CollectionItem[];

  constructor(array: CollectionItem[]){
    super();
    this.array = array;
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
  updateFromParent(options: UpdateFromParentOptions = this.defaultUpdateFromParentOptions){
    if(!this.needsFetchFromParent()) return;

    const items: CollectionItem[] = this.itemsToFetchFromParent();

    for(let i=0; i<items.length; i++){
      const item = items[i];
      const id = item.id;

      const found: CollectionItem | undefined = this.findById(id);

      // This error is only thrown if the conflict resolution strategy is NOT to use parent data.
      // Note that the only other strategy is to raise exception.
      if(found && options.conflictStrategy != UpdateFromParentConflictStrategy.UseParentData && found.updatedAt > item.updatedAt){
        throw new LocalItemNewerThanParentItemError(item.id);
      }

      this.upsert(item);

      this.lastSyncAt = item.updatedAt;
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
