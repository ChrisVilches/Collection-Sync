import { SyncConflictStrategy, SyncOperation } from "../../src";
import PersonItem from "../../src/example-implementations/PersonItem";
import SynchronizableArray from "../../src/example-implementations/SynchronizableArray";
import Synchronizer from "../../src/Synchronizer";
import DocId from "../../src/types/DocId";

function makeItem(id: DocId, date: string): PersonItem {
  return new PersonItem(id, { name: "a", age: 20 }, new Date(date));
}

class Collection extends SynchronizableArray {
  syncIds: DocId[] = [];

  async preExecuteSync(synchronizer: Synchronizer): Promise<boolean> {
    this.syncIds = synchronizer.itemsToSync.map(i => i.id);
    return true;
  }
}

describe("pre execute hook", () => {
  test("before synchronizing, it stores IDs to sync", async () => {
    const slave = new Collection();
    const master = new Collection();
    slave.parent = master;
    master.syncBatch([makeItem(10, "2020/05/10")]);
    expect(slave.syncIds).toHaveLength(0);
    await slave.sync(SyncOperation.Fetch, 10, { conflictStrategy: SyncConflictStrategy.RaiseError });
    expect(slave.syncIds).toHaveLength(1);
  });

  xtest("before synchronizing, check that items haven't been pushed yet to the database", () => {
    // TODO: May need to implement populating upsertedItems in the Synchronizer class (if it's not already implemented).
  });

  xtest("if hook return is false, sync is stopped", () => {

  });
});

describe("pre commit hook", () => {
  xtest("before committing, check that items were pushed to the destination collection", () => {
    // TODO: May need to implement populating upsertedItems in the Synchronizer class (if it's not already implemented).
  });
});

describe("rollback", () => {
  xtest("before synchronizing, do something with with the items to sync, then another thing when rollbacking", () => {

  });
});
