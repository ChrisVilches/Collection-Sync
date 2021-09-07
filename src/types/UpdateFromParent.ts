export enum UpdateFromParentConflictStrategy {
  UseParentData,
  RaiseError
}

export interface UpdateFromParentOptions{
  conflictStrategy: UpdateFromParentConflictStrategy;
}
