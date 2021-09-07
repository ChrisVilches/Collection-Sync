export enum SyncConflictStrategy {
  /** Keep data from the side that initiated the sync. */
  Force,

  /** Abort sync. */
  RaiseError,

  /**
   * In order to fix conflicts correctly, at least one
   * sync must not use ignore and throw error and select option.
  */
  Ignore
}

/** Options for syncing. */
export interface SyncOptions{
  conflictStrategy: SyncConflictStrategy;
}
