enum SyncStatus {
  NotStarted = "NotStarted",
  Running = "Started",
  /**
   * All data to be synced was sent to the destination collection (it hasn't been committed yet).
   * This state is set when the destination collection already has the data to sync stored, regardless
   * of whether it has been committed or not (e.g. it may be in a temporary datastore).
  */
  PreCommitDataTransmittedSuccessfully = "PreCommitDataTransmittedSuccessfully",
  UnexpectedError = "UnexpectedError",
  Conflict = "Conflict",
  Aborted = "Aborted"
}

export default SyncStatus;
