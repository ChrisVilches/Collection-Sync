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
Maybe a better way to test slave/master sync stuff would be to create a
makeMock factory which takes one <ID, date> array per collection (slave, master).
Example:
const { slave, master } = makeMock(
                                    [[id, date], [id, date]],
                                    [[id, date], [id, date], [id, date]]
                                  )
*/

/** Add default values to partial option object. */
function makeOpts(obj: any): SyncOptions {
  const defaultOpts: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  return Object.assign(defaultOpts, obj);
}

function makeItem(id: DocId, date: string): PersonItem {
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

    test(".sync (fetch) with conflict (raise error)", async () => {
      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();

      // Master starts with these two:
      // makeItem("chris123", "2020/01/01"),
      // makeItem("marisel34", "2020/06/01")
      // And slave has last fetched at "2020/02/01"

      // Item "chris123" from master is skipped.
      // Items to sync --> only "marisel34".

      // Slave adds makeItem("marisel34", "2028/06/01"), which is more recent than master one.
      // Conflict arises. It raises error by default.
      // Nothing gets added.

      await slave.sync(SyncOperation.Fetch, 100);

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.Conflict);
      expect(slave.lastSynchronizer?.conflictItems[0]?.id).toEqual("marisel34");
      expect(await slave.countAll()).toEqual(1);
    });

    test(".sync (fetch) with conflict (allow partial sync, none gets partially synced)", async () => {
      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();

      // Master starts with these two:
      // makeItem("chris123", "2020/01/01"),
      // makeItem("marisel34", "2020/06/01")
      // And slave has last fetched at "2020/02/01"

      // Item "chris123" from master is skipped.
      // Items to sync --> only "marisel34".

      // Slave adds makeItem("marisel34", "2028/06/01"), which is more recent than master one.
      // Conflict arises. Partial sync is allowed.
      // But the first one is the conflicting one, so nothing gets added.

      await slave.sync(SyncOperation.Fetch, 100, { conflictStrategy: SyncConflictStrategy.SyncUntilConflict });

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.conflictItems[0]?.id).toEqual("marisel34");
      expect(await slave.countAll()).toEqual(1);
    });

    test(".sync (fetch) with conflict (allow partial sync, none gets partially synced, part II)", async () => {
      expect(await slave.countAll()).toEqual(0);
      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      await master.syncBatch([makeItem("newstuff", "2028/03/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();

      expect(await slave.countAll()).toEqual(1);

      // Master starts with these three:
      // makeItem("chris123", "2020/01/01"),
      // makeItem("marisel34", "2020/06/01")
      // makeItem("newstuff", "2028/03/01")
      // And slave has last fetched at "2020/02/01"

      // Item "chris123" from master is skipped.
      // Items to sync --> "marisel34" and "newstuff"

      // Slave adds makeItem("marisel34", "2028/06/01"), which is more recent than master one.
      // Conflict arises. Partial sync is allowed.
      // But the first one is the conflicting one, so nothing gets added.

      const itemsToFetch = await slave.itemsToSync(SyncOperation.Fetch, 10);
      expect(itemsToFetch.length).toBe(2);
      expect(itemsToFetch[0].id).toBe("marisel34");
      expect(itemsToFetch[1].id).toBe("newstuff");

      await slave.sync(SyncOperation.Fetch, 100, { conflictStrategy: SyncConflictStrategy.SyncUntilConflict });

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.conflictItems[0]?.id).toEqual("marisel34");
      expect(await slave.countAll()).toEqual(1);
    });

    test(".sync (fetch) with conflict (allow partial sync, one gets partially synced)", async () => {
      expect(await slave.countAll()).toEqual(0);

      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      await master.syncBatch([makeItem("newstuff", "2020/05/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();

      // Master starts with these three:
      // makeItem("chris123", "2020/01/01"),
      // makeItem("marisel34", "2020/06/01")
      // makeItem("newstuff", "2020/05/01")
      // And slave has last fetched at "2020/02/01"

      // Item "chris123" from master is skipped.
      // Items to sync --> "newstuff" and "marisel34" (newstuff has lower updatedAt)

      // Slave adds makeItem("marisel34", "2028/06/01"), which is more recent than master one.
      // Conflict arises. Partial sync is allowed.
      // The second one is the conflicting one, so the first one should be added.

      expect(await slave.countAll()).toEqual(1);

      const itemsToFetch = await slave.itemsToSync(SyncOperation.Fetch, 10);
      expect(itemsToFetch.length).toBe(2);
      expect(itemsToFetch[0].id).toBe("newstuff");
      expect(itemsToFetch[1].id).toBe("marisel34");

      await slave.sync(SyncOperation.Fetch, 100, { conflictStrategy: SyncConflictStrategy.SyncUntilConflict });

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.conflictItems[0]?.id).toEqual("marisel34");
      expect(slave.lastSynchronizer?.lastUpdatedAt).toEqual(new Date("2020/05/01"));
      expect(await slave.countAll()).toEqual(2);
    });

    test(".sync (fetch) with conflict (allow partial sync, one gets partially synced)", async () => {
      expect(await slave.countAll()).toEqual(0);

      await slave.syncBatch([makeItem("marisel34", "2028/06/01")]);
      await master.syncBatch([makeItem("newstuff", "2020/05/01")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBeTruthy();

      // Master starts with these three:
      // makeItem("chris123", "2020/01/01"),
      // makeItem("marisel34", "2020/06/01")
      // makeItem("newstuff", "2020/05/01")
      // And slave has last fetched at "2020/02/01"

      // Item "chris123" from master is skipped.
      // Items to sync --> "newstuff" and "marisel34" (newstuff has lower updatedAt)

      // Slave adds makeItem("marisel34", "2028/06/01"), which is more recent than master one.
      // Conflict arises. All or nothing (raise error).
      // The second one is the conflicting one, so none should be added.

      expect(await slave.countAll()).toEqual(1);

      const itemsToFetch = await slave.itemsToSync(SyncOperation.Fetch, 10);
      expect(itemsToFetch.length).toBe(2);
      expect(itemsToFetch[0].id).toBe("newstuff");
      expect(itemsToFetch[1].id).toBe("marisel34");

      await slave.sync(SyncOperation.Fetch, 100, { conflictStrategy: SyncConflictStrategy.RaiseError });

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.Conflict);
      expect(slave.lastSynchronizer?.conflictItems[0]?.id).toEqual("marisel34");
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/02/01")); // Doesn't change.
      expect(slave.lastSynchronizer?.lastUpdatedAt).toEqual(undefined); // Sync process didn't update it.
      expect(await slave.countAll()).toEqual(1);
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

    test(".sync (post) with conflict", async () => {
      await slave.syncBatch([
        makeItem(121, "2025/02/01"),
        makeItem(122, "2025/03/01"),
        makeItem(123, "2025/04/01"),
        makeItem(124, "2025/05/01")
      ]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      expect(await slave.needsSync(SyncOperation.Post)).toBeTruthy();

      await slave.sync(SyncOperation.Post, 100, { conflictStrategy: SyncConflictStrategy.SyncUntilConflict });

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.conflictItems[0]).toBeTruthy;

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
      
      // TODO: Remake this test. I need to add the boolean argument now.
      // expect((await slave.latestUpdatedItem())?.updatedAt).toEqual(new Date("2028/01/01"));
    });

    test(".itemsNewerThan (result sorted by date ASC)", async () => {
      const itemIds = await collectionManyItems.itemsNewerThan(new Date("2015/06/02"), 100, false);
      expect(itemIds.map(i => i.id)).toEqual([4, 3, 7, 1, 5, 9, 8]);
    });

    test(".itemsNewerThan (result sorted by date ASC) with limit", async () => {
      const itemIds = await collectionManyItems.itemsNewerThan(new Date("2015/06/02"), 3, false);
      expect(itemIds.map(i => i.id)).toEqual([4, 3, 7]);
    });

    // TODO: Even after I fix this problem, several more examples are needed!
    //       With multiple slaves from the same parent, etc. Please don't kill this project
    //       by leaving it unfinished. I won't understand the code if I revisit it a few months
    //       later. But if the tests are done, at least I'll be able to modify code and check if
    //       it still works.
    test("real life bi-directional example tempcomment", async () => {
      await master.syncBatch([makeItem(1, "2030/02/01")]);
      await master.syncBatch([makeItem(2, "2030/02/02")]);
      await master.syncBatch([makeItem(3, "2030/02/03")]);
      await master.syncBatch([makeItem(4, "2030/02/04")]);
      await master.syncBatch([makeItem(5, "2030/02/05")]);

      expect(await slave.needsSync(SyncOperation.Post)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true);

      await slave.sync(SyncOperation.Fetch, 100);
      await slave.sync(SyncOperation.Post, 100);
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2030/02/05"));
      // expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2030/02/01"));
      // TODO: I think status should actually be "committed" or something like that (more user friendly).
      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.successfullyCommitted).toBe(true);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Post)).toBe(false);

      let itemsToPost = await slave.itemsToSync(SyncOperation.Post, 100);
      expect(itemsToPost).toHaveLength(0);
      //const itemsInMaster = await master.findByIds(itemsToPost.map(x => x.id));
      //expect(itemsToPost.map(x => x.updatedAt).sort()).toEqual(itemsInMaster.map(x => x.updatedAt).sort());

      await master.syncBatch([makeItem(6, "2030/06/02")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true);

      await slave.sync(SyncOperation.Fetch, 100);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);

      // This is probably because needsSync does not ignore non-updated items like .sync does,
      // it only uses the data to do a quick check. So it needs to post the object it just fetched.
      expect(await slave.needsSync(SyncOperation.Post)).toBe(true);
      itemsToPost = await slave.itemsToSync(SyncOperation.Post, 100);
      expect(itemsToPost).toHaveLength(1);
      expect(itemsToPost[0].updatedAt).toEqual(new Date("2030/06/02"));
      let itemsInMaster = await master.findByIds(itemsToPost.map(x => x.id));

      // But they are actually equal. So they should be ignored (needsSync doesn't do that yet).
      expect(itemsToPost.map(x => x.updatedAt).sort()).toEqual(itemsInMaster.map(x => x.updatedAt).sort());

      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2030/06/02"));
      expect((await master.latestUpdatedItem(false))?.updatedAt).toEqual(new Date("2030/06/02"));

      const newOwnItem = makeItem(7777, "2030/11/05");
      newOwnItem.taint();
      await slave.syncBatch([newOwnItem]);
      expect((await slave.lastFromParent_ONLY_FOR_TESTING())?.updatedAt).toEqual(new Date("2030/06/02"));
      expect((await master.latestUpdatedItem(false))?.updatedAt).toEqual(new Date("2030/06/02"));
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2030/06/02"));
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Post)).toBe(true);

      await slave.sync(SyncOperation.Post, 100);
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2030/06/02"));
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2030/11/05"));
      expect((await master.latestUpdatedItem(false))?.updatedAt).toEqual(new Date("2030/11/05"));
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true); // Last fetch was a long time ago.
      expect(await slave.needsSync(SyncOperation.Post)).toBe(false);

      await slave.sync(SyncOperation.Fetch, 100);
      expect(await slave?.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
      await slave.sync(SyncOperation.Post, 100);
      expect(await slave?.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);//also test items that were synced.
      await slave.sync(SyncOperation.Fetch, 100);
      expect(await slave?.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
      await slave.sync(SyncOperation.Post, 100);
      expect(await slave?.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);

      expect((await master.latestUpdatedItem(false))?.updatedAt).toEqual(new Date("2030/11/05"));
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2030/11/05"));
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Post)).toBe(false);

    });

    xtest(".sync when items are not sorted correctly", () => {
      // expect error.
    });
  });
}

const collectionInitFns = [
  (s?: CollectionSyncMetadata) => new SynchronizableArray(s),
  //(s?: CollectionSyncMetadata) => new SynchronizableNeDB(s),
];

const syncMetadataInitFns: (() => CollectionSyncMetadata)[] = [
  () => new BasicSyncMetadata(new Date("2020/02/01"), new Date("2001/02/01")),
  //() => new JsonFileSyncMetadata("./tmp/", new Date("2020/02/01"), new Date("2001/02/01"))
];

// Test all combinations of class implementations.
for (let i = 0; i < collectionInitFns.length; i++) {
  for (let j = 0; j < collectionInitFns.length; j++) {
    for (let k = 0; k < syncMetadataInitFns.length; k++) {
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
