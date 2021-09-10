export enum SyncConflictStrategy {
  /** Keep data from the side that initiated the sync. */
  Force = "Force",

  /** Abort sync (sync all or none). */
  RaiseError = "RaiseError",

  /**
   * TODO: Improve comment.
   * In order to fix conflicts correctly, at least one
   * sync must not use ignore and throw error and select option.
  */
  Ignore = "Ignore",

  SyncUntilConflict = "SyncUntilConflict"
}

/** Options for syncing. */
export interface SyncOptions{
  conflictStrategy: SyncConflictStrategy;
}

export enum SyncOperation{
  Fetch,
  Post
}
