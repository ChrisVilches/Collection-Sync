export enum SyncConflictStrategy {
  /**
   * Force synchronizing by using the data from the source collection.
   * Fetch will use the parent's data to update local data. Post will use
   * data from the local collection and force it
   * into the parent.
  */
  Force = "Force",

  /** Abort sync if there's a conflicting item in the item set to sync (i.e. sync all or none). */
  RaiseError = "RaiseError",

  /** Ignore conflicting items (do nothing about them). */
  Ignore = "Ignore",

  /** Syncs the items in order until there's a conflict. */
  SyncUntilConflict = "SyncUntilConflict"

  // TODO: Also new conflict strategies can be introduced, such as "Force if newer", "Raise error if older" or something like that.
}

/** Options for syncing. */
export interface SyncOptions{
  conflictStrategy: SyncConflictStrategy;
}

export enum SyncOperation{
  Fetch,
  Post
}
