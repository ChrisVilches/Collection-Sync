import SynchronizableCollection from "../src/SynchronizableCollection";
import SynchronizableArray from "../src/example-implementations/SynchronizableArray";
import SynchronizableNeDB from "../src/example-implementations/SynchronizableNeDB";
import ParentNotSetError from "../src/exceptions/ParentNotSetError";
import PersonItem from "../src/example-implementations/PersonItem";
import DocId from "../src/types/DocId";
import { SyncConflictStrategy, SyncOptions, SyncOperation } from "../src/types/SyncTypes";
import JsonFileSyncMetadata from "../src/example-implementations/JsonFileSyncMetadata";
import BasicSyncMetadata from "../src/example-implementations/BasicSyncMetadata";
import CollectionSyncMetadata from "../src/CollectionSyncMetadata";
import SyncStatus from "../src/types/SyncStatus";

/**
 * Not the best way to reuse shared tests, but this one works to test the syncing mechanism
 * using all combinations of class implementations (to make sure it works on all kinds of databases).
 */

/*
TODO: Maybe a better way to test slave/master sync stuff would be to create a
      makeMock factory which takes one <ID, date> array per collection (slave, master).
      Example:
      const { slave, master } = makeMock(
                                          [[id, date], [id, date]],
                                          [[id, date], [id, date], [id, date]]
                                        )
*/

/** Add default values to partial option object. */
function makeOpts(obj: any): SyncOptions{
  const defaultOpts: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  return Object.assign(defaultOpts, obj);
}

function makeItem(id: DocId, date: string): PersonItem{
  return new PersonItem(id, { name: "a", age: 20 }, new Date(date));
}

const personItems: PersonItem[] = [
  makeItem("chris123", "2020/01/01"),
  makeItem("marisel34", "2020/06/01")
];

const manyItems = [
  makeItem(1, "2020/01/01"),
  makeItem(2, "2015/06/01"),
  makeItem(3, "2018/06/01"),
  makeItem(4, "2016/06/01"),
  makeItem(5, "2021/02/01"),
  makeItem(6, "2014/05/01"),
  makeItem(7, "2019/07/01"),
  makeItem(8, "2023/03/01"),
  makeItem(9, "2022/11/01")
];

interface TestExecutionArgument {
  slaveInit: (s: CollectionSyncMetadata) => SynchronizableCollection
  masterInit: () => SynchronizableCollection
  syncMetadataInit: () => CollectionSyncMetadata
};

const executeAllTests = (options: TestExecutionArgument) => {
  let slave: SynchronizableCollection;
  let master: SynchronizableCollection;
  let collectionManyItems: SynchronizableCollection;

  const initializeMock = async () => {
    const syncMetadata = options.syncMetadataInit();
    slave = options.slaveInit(syncMetadata);
    master = options.masterInit();
    collectionManyItems = options.masterInit();

    slave.parent = master;
    await syncMetadata.initialize();
    await slave.initialize();
    await master.initialize();
    await collectionManyItems.initialize();

    await master.syncBatch(personItems);
    await collectionManyItems.syncBatch(manyItems);
  };

  describe("SynchronizableArray", () => {
    beforeEach(initializeMock);

    afterAll(() => {
      require("child_process").execSync("rm -f ./tmp/*data_sync*.json");
    });

    test(".array (initial constructor)", async () => {
      expect(await slave.countAll()).toEqual(0);
      expect(await master.countAll()).toEqual(2);
    });
    
    test(".needsSync (fetch)", async () => {
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();
      expect(await master.needsSync(SyncOperation.Fetch)).toBeFalsy();
    });
    
    test(".itemsToSync (fetch)", async () => {
      expect(await slave.itemsToSync(SyncOperation.Fetch, 100)).toHaveLength(1);
      await expect(async () => { await master.itemsToSync(SyncOperation.Fetch, 100) })
      .rejects
      .toThrow(ParentNotSetError);
    });

    test(".needsSync (fetch)", async () => {
      await slave.sync(SyncOperation.Fetch, 100);
      expect((await slave.findByIds([personItems[1].id]))[0]?.id).toBe(personItems[1].id);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeFalsy();
    });

    test(".sync (fetch) with conflict", async () => {
      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();

      await slave.sync(SyncOperation.Fetch, 100);

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.Conflict);
      expect(slave.lastSynchronizer?.conflictItem?.id).toEqual("marisel34");
    });

    test(".sync (fetch) with conflict (use parent data)", async () => {
      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();
      await slave.sync(SyncOperation.Fetch, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Force }));

      // Uses parent data.
      expect((await slave.findByIds(["marisel34"]))[0]?.updatedAt).toEqual(new Date("2020/06/01"));
    });

    test(".sync (fetch) with conflict (use ignore strategy)", async () => {
      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();
      await slave.sync(SyncOperation.Fetch, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }));
      expect((await slave.findByIds(["marisel34"]))[0]?.updatedAt).toEqual(new Date("2028/06/01"));
    });

    test(".needsSync (post)", async () => {
      expect(await slave.needsSync(SyncOperation.Post)).toBeFalsy();
      await slave.syncBatch([makeItem(123, "2026/01/01")]);
      expect(await slave.needsSync(SyncOperation.Post)).toBeTruthy();
    });

    test(".sync (post)", async () => {
      expect(await slave.countAll()).toEqual(0);
      expect(await master.countAll()).toEqual(2);
      await slave.syncBatch([makeItem(1231, "2026/01/01")]);
      expect(await slave.needsSync(SyncOperation.Post)).toBeTruthy();
      await slave.sync(SyncOperation.Post, 100);
      expect(await slave.needsSync(SyncOperation.Post)).toBeFalsy();
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2026/01/01"));

      await slave.syncBatch([makeItem(1232, "2027/01/01")]);
      expect(await slave.needsSync(SyncOperation.Post)).toBeTruthy();
      await slave.sync(SyncOperation.Post, 100);
      expect(await slave.needsSync(SyncOperation.Post)).toBeFalsy();
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2027/01/01"));
      expect(await slave.countAll()).toEqual(2);
      expect(await master.countAll()).toEqual(4);
    });

    test(".sync (post) corrupted updatedAt does not get posted", async () => {
      expect(await slave.countAll()).toEqual(0);
      expect(await master.countAll()).toEqual(2);
      await slave.syncBatch([makeItem(123, "1995/01/01")]);
      expect(await slave.needsSync(SyncOperation.Post)).toBeFalsy();
      await slave.sync(SyncOperation.Post, 100);
      expect(await slave.countAll()).toEqual(1);
      expect(await master.countAll()).toEqual(2);
    });

    test(".sync (post) with conflict tempcomment", async () => {
      await slave.syncBatch([
        makeItem(121, "2025/02/01"),
        makeItem(122, "2025/03/01"),
        makeItem(123, "2025/04/01"),
        makeItem(124, "2025/05/01")
      ]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      expect(await slave.needsSync(SyncOperation.Post)).toBeTruthy();

      await slave.sync(SyncOperation.Post, 100, { conflictStrategy: SyncConflictStrategy.SyncUntilConflict });

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.SuccessPartial);

      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2025/03/01"));
    });

    test(".sync (post) with conflict (use slave data)", async () => {
      await slave.syncBatch([makeItem(123, "2025/01/01")]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      await slave.sync(SyncOperation.Post, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Force }));
      expect((await slave.findByIds([123]))[0]?.updatedAt).toEqual(new Date("2025/01/01"));
      expect((await master.findByIds([123]))[0]?.updatedAt).toEqual(new Date("2025/01/01"));
    });

    test(".sync (post) with conflict (use ignore strategy)", async () => {
      await slave.syncBatch([makeItem(123, "2025/01/01")]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      await slave.sync(SyncOperation.Post, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }));
      // NOTE: latest post date is updated even if one is ignored.
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2025/01/01"));
    });

    test(".sync (post) with conflict (use ignore strategy)", async () => {
      await slave.syncBatch([
        makeItem(123, "2025/01/01"),
        makeItem(124, "2028/01/01")
      ]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      await slave.sync(SyncOperation.Post, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }));
      expect((await slave.findByIds([123]))[0]?.updatedAt).toEqual(new Date("2025/01/01"));
      expect((await master.findByIds([123]))[0]?.updatedAt).toEqual(new Date("2026/01/01"));

      // NOTE: Latest post date is updated even if one is ignored.
      //       In this case, ignored item is NOT the last one to be synced.
      //       The reason why this is OK, is because a full sync consists of both post and fetch,
      //       and at first, the conflict strategy must be set to error. Only after, the user should
      //       manually pick which data to keep (local, or server) and then set the flags accordingly
      //       so that one is ignored, and the other one is forced. It's similar to a git merge
      //       and then manually fixing conflicts.
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2028/01/01"));
      expect((await slave.latestUpdatedItem())?.updatedAt).toEqual(new Date("2028/01/01"));
    });

    test(".itemsNewerThan (result sorted by date ASC)", async () => {
      const itemIds = await collectionManyItems.itemsNewerThan(new Date("2015/06/02"), 100);
      expect(itemIds.map(i => i.id)).toEqual([4, 3, 7, 1, 5, 9, 8]);
    });

    test(".itemsNewerThan (result sorted by date ASC) with limit", async () => {
      const itemIds = await collectionManyItems.itemsNewerThan(new Date("2015/06/02"), 3);
      expect(itemIds.map(i => i.id)).toEqual([4, 3, 7]);
    });

    xtest(".sync when items are not sorted correctly", () => {
      // expect error.
    });
  });
}

const collectionInitFns = [
  (s?: CollectionSyncMetadata) => new SynchronizableArray(s),
  (s?: CollectionSyncMetadata) => new SynchronizableNeDB(s),
];

const syncMetadataInitFns: (() => CollectionSyncMetadata)[] = [
  () => new BasicSyncMetadata(new Date("2020/02/01"), new Date("2001/02/01")),
  () => new JsonFileSyncMetadata("./tmp/", new Date("2020/02/01"), new Date("2001/02/01"))
];

// Test all combinations of class implementations.
for(let i=0; i<collectionInitFns.length; i++){
  for(let j=0; j<collectionInitFns.length; j++){
    for(let k=0; k<syncMetadataInitFns.length; k++){
      let slaveInit = collectionInitFns[i];
      let masterInit = collectionInitFns[j];
      let syncMetadataInit = syncMetadataInitFns[k];
  
      executeAllTests({
        slaveInit,
        masterInit,
        syncMetadataInit
      });
    }
  }
}
