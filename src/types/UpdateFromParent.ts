export enum UpdateFromParentConflictStrategy {
  UseParentData,
  RaiseError,

  /**
   * In order to fix conflicts correctly, at least one
   * sync must not use ignore and throw error and select option.
  */
  Ignore
}

/** Options for when node updates its data using parent's data. */
export interface UpdateFromParentOptions{
  conflictStrategy: UpdateFromParentConflictStrategy;
}


// TODO: Maybe can be refactored so that only one option file/interface is used for both sync operations.
//       For example it could be called "force", which means keep the
//       incoming data (from the side that initiated the sync operation).
