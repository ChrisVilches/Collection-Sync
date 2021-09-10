import Synchronizer from "./Synchronizer";
import SyncStatus from "./types/SyncStatus";

export default class SyncPolicy{
  /** Indicates whether rollback should be executed or not. */
  static shouldRollBack(synchronizer: Synchronizer): boolean{
    const syncStatus = synchronizer.syncStatus;
    return syncStatus == SyncStatus.UnexpectedError ||
             !synchronizer.successfullyCommitted ||
             syncStatus == SyncStatus.Aborted;
  }

  /** Indicates whether commit should be executed or not. */
  static shouldCommit(syncStatus: SyncStatus): boolean{
    if(syncStatus == SyncStatus.PreCommitDataTransmittedSuccessfully) return true;
    return false;
  }

  /** Indicates whether last sync date should be updated or not. */
  static shouldUpdateLastSyncAt(synchronizer: Synchronizer): boolean{
    return synchronizer.successfullyCommitted &&
             Boolean(synchronizer.lastUpdatedAt) &&
             !synchronizer.successfullyRollbacked; // This condition is probably unnecessary since it overlaps with the other ones.
  }
}
