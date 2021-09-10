import SyncItem from "../SyncItem";
import SynchronizableCollection from "../SynchronizableCollection";
import BasicSyncMetadata from "./BasicSyncMetadata";
import DocId from "../types/DocId";
import CollectionSyncMetadata from "../CollectionSyncMetadata";
import * as R from "ramda";

class SynchronizableArray extends SynchronizableCollection{
  private array: SyncItem[];

  constructor(syncMetadata: CollectionSyncMetadata = new BasicSyncMetadata()){
    super(syncMetadata);
    this.array = [];
  }

  async initialize(){

  }

  countAll(): number{
    return this.array.length;
  }

  itemsNewerThan(date: Date | undefined, limit: number): SyncItem[]{
    if(!date){
      return this.array;
    }
    let filteredArray = this.array.sort((a: SyncItem, b: SyncItem) => (a.updatedAt as any) - (b.updatedAt as any))
                                  .filter(item => date < item.updatedAt);

    return R.take(limit, filteredArray);
  }

  private findById(id: DocId): SyncItem | undefined{
    return this.array.find((x: SyncItem) => x.id == id);
  }

  findByIds(ids: DocId[]): SyncItem[]{
    const idSet = new Set(ids);
    const result: SyncItem[] = [];
    for(let i=0; i<this.array.length; i++){
      if(idSet.has(this.array[i].id)){
        result.push(this.array[i]);
      }
    }
    return result;
  }

  private upsert(item: SyncItem){
    const found: SyncItem | undefined = this.findById(item.id);
    if(found){
      found.update(item.document, item.updatedAt);
      return found;
    } else {
      this.array.push(item);
      return item;
    }
  }

  syncBatch(items: SyncItem[]): SyncItem[]{
    return items.map(this.upsert.bind(this));
  }

  latestUpdatedItem(): SyncItem | undefined{
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
