import ConflictPolicy from "../src/ConflictPolicy";
import { SyncConflictStrategy, SyncItem } from "../src";
import SyncItemAction from "../src/types/SyncItemAction";

class DummyItem extends SyncItem {}

function makeItem(date: string): SyncItem{
  return new DummyItem('', {}, new Date(date), SyncItemAction.Update);
}

describe("ConflictPolicy", () => {
  test(".shouldSyncItem", () => {
    expect(ConflictPolicy.shouldSyncItem(true, SyncConflictStrategy.Force, true)).toBe(false);
    expect(ConflictPolicy.shouldSyncItem(false, SyncConflictStrategy.RaiseError, true)).toBe(false);
    expect(ConflictPolicy.shouldSyncItem(false, SyncConflictStrategy.Force, true)).toBe(false);

    expect(ConflictPolicy.shouldSyncItem(true, SyncConflictStrategy.Force, false)).toBe(true);
    expect(ConflictPolicy.shouldSyncItem(true, SyncConflictStrategy.SyncUntilConflict, false)).toBe(false);
    expect(ConflictPolicy.shouldSyncItem(false, SyncConflictStrategy.Force, false)).toBe(true);
    expect(ConflictPolicy.shouldSyncItem(false, SyncConflictStrategy.RaiseError, false)).toBe(true);
    expect(ConflictPolicy.shouldSyncItem(false, SyncConflictStrategy.Force, false)).toBe(true);
    expect(ConflictPolicy.shouldSyncItem(true, SyncConflictStrategy.Ignore, false)).toBe(false);
  });

  test(".shouldStopAdding", () => {
    expect(ConflictPolicy.shouldStopAdding(true, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldStopAdding(true, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldStopAdding(true, SyncConflictStrategy.RaiseError)).toBe(true);
    expect(ConflictPolicy.shouldStopAdding(true, SyncConflictStrategy.SyncUntilConflict)).toBe(true);
    expect(ConflictPolicy.shouldStopAdding(false, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldStopAdding(false, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldStopAdding(false, SyncConflictStrategy.RaiseError)).toBe(false);
    expect(ConflictPolicy.shouldStopAdding(false, SyncConflictStrategy.SyncUntilConflict)).toBe(false);
  });

  test(".shouldIgnoreItem", () => {
    expect(ConflictPolicy.shouldIgnoreItem(true, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldIgnoreItem(true, SyncConflictStrategy.Ignore)).toBe(true);
    expect(ConflictPolicy.shouldIgnoreItem(true, SyncConflictStrategy.RaiseError)).toBe(false);
    expect(ConflictPolicy.shouldIgnoreItem(true, SyncConflictStrategy.SyncUntilConflict)).toBe(false);
    expect(ConflictPolicy.shouldIgnoreItem(false, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldIgnoreItem(false, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldIgnoreItem(false, SyncConflictStrategy.RaiseError)).toBe(false);
    expect(ConflictPolicy.shouldIgnoreItem(false, SyncConflictStrategy.SyncUntilConflict)).toBe(false);
  });

  test(".shouldHandleAsConflict", () => {
    expect(ConflictPolicy.shouldHandleAsConflict(true, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldHandleAsConflict(true, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldHandleAsConflict(true, SyncConflictStrategy.RaiseError)).toBe(true);
    expect(ConflictPolicy.shouldHandleAsConflict(true, SyncConflictStrategy.SyncUntilConflict)).toBe(true);
    expect(ConflictPolicy.shouldHandleAsConflict(false, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldHandleAsConflict(false, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldHandleAsConflict(false, SyncConflictStrategy.RaiseError)).toBe(false);
    expect(ConflictPolicy.shouldHandleAsConflict(false, SyncConflictStrategy.SyncUntilConflict)).toBe(false);
  });

  test(".isConflict", () => {
    expect(ConflictPolicy.isConflict(new Date("2020/01/10"), makeItem("2020/01/10"))).toBe(false);
    expect(ConflictPolicy.isConflict(new Date("2020/01/11"), makeItem("2020/01/10"))).toBe(false);
    expect(ConflictPolicy.isConflict(new Date("2020/01/05"), makeItem("2020/01/10"))).toBe(true);

    expect(ConflictPolicy.isConflict(new Date("2020/01/05"), undefined)).toBe(false);
    expect(ConflictPolicy.isConflict(undefined, makeItem("2020/01/10"))).toBe(false);
    expect(ConflictPolicy.isConflict(undefined, undefined)).toBe(false);
  });

  test(".shouldSetStatusAsConflict", () => {
    expect(ConflictPolicy.shouldSetStatusAsConflict(true, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldSetStatusAsConflict(true, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldSetStatusAsConflict(true, SyncConflictStrategy.RaiseError)).toBe(true);
    expect(ConflictPolicy.shouldSetStatusAsConflict(true, SyncConflictStrategy.SyncUntilConflict)).toBe(false);
    expect(ConflictPolicy.shouldSetStatusAsConflict(false, SyncConflictStrategy.Force)).toBe(false);
    expect(ConflictPolicy.shouldSetStatusAsConflict(false, SyncConflictStrategy.Ignore)).toBe(false);
    expect(ConflictPolicy.shouldSetStatusAsConflict(false, SyncConflictStrategy.RaiseError)).toBe(false);
    expect(ConflictPolicy.shouldSetStatusAsConflict(false, SyncConflictStrategy.SyncUntilConflict)).toBe(false);
  });
});
