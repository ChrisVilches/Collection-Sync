import Synchronizer from "../src/Synchronizer";
import SyncPolicy from "../src/SyncPolicy";
import SyncStatus from "../src/types/SyncStatus";

// NOTE: Not entirely sure that mocking Synchronizer objects as a map works.
//       But the assertions seem to work properly in this case.

describe("SyncStatus", () => {
  test(".shouldRollBack", () => {
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: true, syncStatus: SyncStatus.Aborted } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: true, syncStatus: SyncStatus.Conflict } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: true, syncStatus: SyncStatus.NotStarted } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: true, syncStatus: SyncStatus.Success } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: true, syncStatus: SyncStatus.SuccessPartial } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: true, syncStatus: SyncStatus.UnexpectedError } as Synchronizer)).toBe(true);

    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: false, syncStatus: SyncStatus.Aborted } as Synchronizer)).toBe(true);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: false, syncStatus: SyncStatus.Conflict } as Synchronizer)).toBe(true);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: false, syncStatus: SyncStatus.NotStarted } as Synchronizer)).toBe(true);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: false, syncStatus: SyncStatus.Success } as Synchronizer)).toBe(true);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: false, syncStatus: SyncStatus.SuccessPartial } as Synchronizer)).toBe(true);
    expect(SyncPolicy.shouldRollBack({ successfullyCommitted: false, syncStatus: SyncStatus.UnexpectedError } as Synchronizer)).toBe(true);
  });

  test(".shouldCommit", () => {
    expect(SyncPolicy.shouldCommit(SyncStatus.Aborted)).toBe(false);
    expect(SyncPolicy.shouldCommit(SyncStatus.Conflict)).toBe(false);
    expect(SyncPolicy.shouldCommit(SyncStatus.NotStarted)).toBe(false);
    expect(SyncPolicy.shouldCommit(SyncStatus.Success)).toBe(true);
    expect(SyncPolicy.shouldCommit(SyncStatus.SuccessPartial)).toBe(true);
    expect(SyncPolicy.shouldCommit(SyncStatus.UnexpectedError)).toBe(false);
  });

  test(".shouldUpdateLastSyncAt", () => {
    expect(SyncPolicy.shouldUpdateLastSyncAt({ successfullyCommitted: true, lastUpdatedAt: undefined } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldUpdateLastSyncAt({ successfullyCommitted: false, lastUpdatedAt: undefined } as Synchronizer)).toBe(false);
    expect(SyncPolicy.shouldUpdateLastSyncAt({ successfullyCommitted: true, lastUpdatedAt: new Date() } as Synchronizer)).toBe(true);
    expect(SyncPolicy.shouldUpdateLastSyncAt({ successfullyCommitted: false, lastUpdatedAt: new Date() } as Synchronizer)).toBe(false);
  });
});
