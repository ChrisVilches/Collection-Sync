import Synchronizer from "./Synchronizer";
import SyncStatus from "./types/SyncStatus";

export default class SyncPolicy{
  /** Indicates whether rollback should be executed or not. */
  static shouldRollBack(synchronizer: Synchronizer): boolean{
    const syncStatus = synchronizer.syncStatus;
    return !synchronizer.successfullyCommitted || syncStatus == SyncStatus.UnexpectedError;
  }

  /** Indicates whether commit should be executed or not. */
  static shouldCommit(syncStatus: SyncStatus): boolean{
    if(syncStatus == SyncStatus.Success) return true;
    if(syncStatus == SyncStatus.SuccessPartial) return true;
    return false;
  }

  /** Indicates whether last sync date should be updated or not. */
  static shouldUpdateLastSyncAt(synchronizer: Synchronizer): boolean{
    return synchronizer.successfullyCommitted && Boolean(synchronizer.lastUpdatedAt);
  }
}
