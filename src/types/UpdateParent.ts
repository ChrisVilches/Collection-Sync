export enum UpdateParentConflictStrategy {
  UseOwnData,
  RaiseError,

  /**
   * In order to fix conflicts correctly, at least one
   * sync must not use ignore and throw error and select option.
  */
  Ignore
}

/** Options for when node updates its parent. */
export interface UpdateParentOptions{
  conflictStrategy: UpdateParentConflictStrategy;
}
