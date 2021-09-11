import { SyncItem } from ".";
import { SyncConflictStrategy } from "./types/SyncTypes";

class ConflictPolicy{
  static shouldSyncItem(conflict: boolean, conflictStrategy: SyncConflictStrategy, stoppedAdding: boolean): boolean{
    if(stoppedAdding) return false;
    return conflictStrategy == SyncConflictStrategy.Force || !conflict;
  }

  static shouldStopAdding(conflict: boolean, conflictStrategy: SyncConflictStrategy): boolean{
    return conflict && (conflictStrategy == SyncConflictStrategy.RaiseError || conflictStrategy == SyncConflictStrategy.SyncUntilConflict);
  }

  static shouldIgnoreItem(conflict: boolean, conflictStrategy: SyncConflictStrategy): boolean{
    return conflict && conflictStrategy == SyncConflictStrategy.Ignore;
  }

  static shouldHandleAsConflict(conflict: boolean, conflictStrategy: SyncConflictStrategy): boolean{
    if(conflictStrategy == SyncConflictStrategy.Ignore) return false;
    if(conflictStrategy == SyncConflictStrategy.Force) return false;
    return conflict;
  }

  /**
   * This one is a bit tricky to understand maybe, so explanation:
   * This method is being executed only for items that are going to be compared. And only items that
   * are not yet synced are obtained from the source collection. Not yet synced means "updatedAt higher
   * than the collection last sync date". Therefore, the item from the source collection has been updated
   * after the last sync, and there'll be a conflict if also the destination collection item has changed
   * since the last sync date (i.e. higher than the source collection last sync date).
   * 
   * Bottom line, it's only necessary to check whether the object from the destination collection has been
   * updated after the last sync. That means there's a conflict.
   * 
   * Also, keep in mind that the item from the source collection also has updatedAt > last sync date
   * (which is the reason it was fetched for syncing in the first place).
  */
  static isConflict(collectionLastSyncAt: Date | undefined, itemToCompare?: SyncItem): boolean{
    if(!itemToCompare) return false;
    if(!collectionLastSyncAt) return false;
    if(itemToCompare.updatedAt > collectionLastSyncAt)
      console.log(`CONFLICT (comparing with item ID ${itemToCompare.id})`, itemToCompare.updatedAt, ">",  collectionLastSyncAt)
    return itemToCompare.updatedAt > collectionLastSyncAt;
  }

  static shouldSetStatusAsConflict(hasConflicts: boolean, conflictStrategy: SyncConflictStrategy): boolean{
    return hasConflicts && conflictStrategy == SyncConflictStrategy.RaiseError
  }
}

export default ConflictPolicy;
