import CollectionItem from "./CollectionItem";
import SynchronizableCollection from "./SynchronizableCollection";

class SynchronizableArray extends SynchronizableCollection{
  array: CollectionItem[];

  constructor(array: CollectionItem[]){
    super();
    this.array = array;
  }

  countAll(): number{
    return this.array.length;
  }

  findAll(): CollectionItem[]{
    return this.array;
  }

  itemsNewerThan(date: Date | undefined): CollectionItem[]{
    if(date == undefined){
      return this.array;
    }
    return this.array.filter(item => date < item.updatedAt);
  }

  findById(id: string | number): CollectionItem | undefined{
    return this.array.find((x: CollectionItem) => x.id == id);
  }

  updateFromParent(){
    if(!this.needsFetchFromParent()) return;

    const items: CollectionItem[] = this.itemsToFetchFromParent();

    // TODO: Make sure items are in updatedAt order. Or implement something that ensures it,
    //       and/or throws an error if it detects its not sorted. This is because the algorithm
    //       would stop when it encounters a conflict, having updated everything with a updatedAt
    //       lower than the current element, possibly modifying the lastSyncAt to that point in time.
    //       (So that the items prior to the conflict are not synced again).

    console.log("Items to update:")
    console.log(items)
    for(let i=0; i<items.length; i++){
      const item = items[i];
      const id = item.id;

      const found: CollectionItem | undefined = this.findById(id);

      if(found){
        found.update(item.document, item.updatedAt, item.deleted)
      } else {
        this.array.push(item);
      }
    }
  }

  lastUpdateAt(): Date | null{
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
