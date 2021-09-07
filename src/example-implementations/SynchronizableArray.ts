import CollectionItem from "../CollectionItem";
import SynchronizableCollection from "../SynchronizableCollection";
import BasicSyncMetadata from "./BasicSyncMetadata";
import DocId from "../types/DocId";
import { List } from "immutable";

class SynchronizableArray extends SynchronizableCollection{
  private array: CollectionItem[];

  constructor(array: CollectionItem[], syncMetadata = new BasicSyncMetadata()){
    super(syncMetadata);
    this.array = List(array).toArray(); // It seems R.clone doesn't work for cloning (several tests fail).
  }

  countAll(): number{
    return this.array.length;
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
      found.update(item.document, item.updatedAt);
      return found;
    } else {
      this.array.push(item);
      return item;
    }
  }

  latestUpdatedItem(): CollectionItem | undefined{
    if(this.array.length == 0) return undefined;

    let latest = this.array[0];

    for(let i=0; i<this.array.length; i++){
      let curr = this.array[i];
      if(latest.updatedAt < curr.updatedAt){
        latest = curr;
      }
    }

    return latest;
  }
}

export default SynchronizableArray;