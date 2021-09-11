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

  // TODO: Ok, this method can be changed to "items to sync", and the user implements it,
  //       but he's dumb so let's give him tips about what and how to implement.
  //
  //       And in that case, then remove "onlyDirtyItems" flag, and simply tell them to put that flag
  //       but that would require one method for posting (use the flag), and another method without
  //       which probably wouldn't require that flag. Or maybe? I don't know lol (MUST THINK AND TEST!!!!!).
  itemsNewerThan(date: Date | undefined, limit: number, onlyDirtyItems: boolean = false): SyncItem[]{
    if(!date){
      return this.array;
    }
    let filteredArray = this.array.sort((a: SyncItem, b: SyncItem) => (a.updatedAt as any) - (b.updatedAt as any))
                                  .filter(item => date < item.updatedAt);

    if(onlyDirtyItems){
      filteredArray = filteredArray.filter(item => item.dirty);
    }

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

  // TODO: Refactor all this "onlyDirtyItems" stuff, and make it a more elegant method name.
  //       In a way that the user has to figure out how to implement it.
  //       Also onlyDirtyItems is set differently for slave and parent. Remember that many
  //       slaves can push to parent, therefore just because it's not dirty it doesn't mean
  //       other slaves don't need that data.
  latestUpdatedItem(onlyDirtyItems: boolean): SyncItem | undefined{
    let array: SyncItem[] = this.array;
    
    if(onlyDirtyItems){
      array = array.filter(item => item.dirty);
    }

    if(array.length == 0) return undefined;

    let latest = array[0];

    for(let i=0; i<array.length; i++){
      let curr = array[i];
      if(latest.updatedAt < curr.updatedAt){
        latest = curr;
      }
    }

    return latest;
  }
}

export default SynchronizableArray;
