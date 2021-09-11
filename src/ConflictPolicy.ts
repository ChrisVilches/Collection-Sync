import SyncItem from "./SyncItem";
import { SyncConflictStrategy } from "./types/SyncTypes";

class ConflictPolicy {
  static itemsSameVersion(item1: SyncItem, item2: SyncItem) {
    return item1.equals(item2);
  }

  static shouldSyncItem(conflict: boolean, conflictStrategy: SyncConflictStrategy, stoppedAdding: boolean): boolean {
    if (stoppedAdding) return false;
    return conflictStrategy == SyncConflictStrategy.Force || !conflict;
  }

  static shouldStopAdding(conflict: boolean, conflictStrategy: SyncConflictStrategy): boolean {
    return conflict && (conflictStrategy == SyncConflictStrategy.RaiseError || conflictStrategy == SyncConflictStrategy.SyncUntilConflict);
  }

  static shouldIgnoreItem(conflict: boolean, conflictStrategy: SyncConflictStrategy): boolean {
    return conflict && conflictStrategy == SyncConflictStrategy.Ignore;
  }

  static shouldHandleAsConflict(conflict: boolean, conflictStrategy: SyncConflictStrategy): boolean {
    if (conflictStrategy == SyncConflictStrategy.Ignore) return false;
    if (conflictStrategy == SyncConflictStrategy.Force) return false;
    return conflict;
  }

  static isConflict(collectionLastSyncAt: Date | undefined, item: SyncItem, itemToCompare?: SyncItem): boolean {
    if (!itemToCompare) return false;
    if (!collectionLastSyncAt) return false;
    if (ConflictPolicy.itemsSameVersion(item, itemToCompare)) return false;
    return itemToCompare.updatedAt > collectionLastSyncAt;
  }

  static shouldSetStatusAsConflict(hasConflicts: boolean, conflictStrategy: SyncConflictStrategy): boolean {
    return hasConflicts && conflictStrategy == SyncConflictStrategy.RaiseError
  }
}

export default ConflictPolicy;
