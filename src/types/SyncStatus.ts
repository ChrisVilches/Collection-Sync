enum SyncStatus {
  UnexpectedError = "UnexpectedError",
  Conflict = "Conflict",
  NotStarted = "NotStarted",

  /** Data was synced without conflicts. */
  Success = "Success",
  Aborted = "Aborted",

  // TODO: The "success" (full and partial) should be renamed to something that says
  //       that data was uploaded to master collection BEFORE committing (it has no relationship
  //       with commiting)
  /** Data was synced until a conflict was encountered. */
  SuccessPartial = "SuccessPartial",
}

export default SyncStatus;
