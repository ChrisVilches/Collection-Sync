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

async function isHighestDateInCollection(date: Date | undefined, collection: SynchronizableCollection): Promise<boolean> {
  if (!date) return false;
  const highestUpdatedAt = (await collection.latestUpdatedItem())?.updatedAt;
  const result = highestUpdatedAt == date;
  return result;
}

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

      // Note that the date above is year 2028, and it changes to today (local machine where Jest runs),
      // so it may get strange. But anyway, this behavior seems to be correct, because it happens when
      // using ignore (it re-writes the same data using NOW as date, so that it can then be pushed, because
      // it's necessary to make the item have a newer date, so that it's elegible for pushing).
      expect(await isHighestDateInCollection((await slave.findByIds(["marisel34"]))[0]?.updatedAt, slave)).toBe(true);
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
      // NOTE: This example is not how a full-sync would be executed in real life.
      //       It's first necessary to perform a fetch, otherwise data would get corrupted.
      //       In this case, by not making a fetch first, the object in the slave gets "shadowed" by
      //       the one in the master, which gets the mockedSyncDate date after sync (post) is done.
      const mockedSyncDate: Date = new Date("2030/06/01");
      await slave.syncBatch([makeItem(123, "2025/01/01")]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      await slave.sync(SyncOperation.Post, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }), mockedSyncDate);
      expect((await slave.findByIds([123]))[0].updatedAt).toEqual(new Date("2025/01/01"));
      expect((await master.findByIds([123]))[0].updatedAt).toEqual(mockedSyncDate);

      // NOTE: latest post date is updated even if one is ignored. The ignored object is re-sent but with
      //       current date (sync date, the date when the sync operation is executed, unrelated to any date in the DB.)
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(mockedSyncDate);
    });

    test(".sync (post) with conflict (use ignore strategy), with fetch first (full-sync)", async () => {
      // NOTE: Same example as previous one, but without shadowing the item.
      const mockedSyncDate: Date = new Date("2030/06/01");
      await slave.syncBatch([makeItem(123, "2025/01/01")]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      await slave.sync(SyncOperation.Fetch, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }), mockedSyncDate);
      expect(slave.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect((await slave.findByIds([123]))[0].updatedAt).toEqual(mockedSyncDate);
      expect((await master.findByIds([123]))[0].updatedAt).toEqual(new Date("2026/01/01"));

      // TODO: Should be .Force
      //       When using .Ignore, other tests (apart from this one) also fail, which means some strange bug going on.
      //       But it also fails with Array collection it seems (not when using NeDB). Probably just an interface implementation
      //       bug (NeDB still works properly, so that's great). But still fix please.
      //       Not that after fixing that bug (i.e. breaking other tests, this should be changed to .Force,
      //       because we are doing a full-sync here.)
      await slave.sync(SyncOperation.Post, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }));
      expect(slave.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect((await slave.findByIds([123]))[0].updatedAt).toEqual(mockedSyncDate);
      expect((await master.findByIds([123]))[0].updatedAt).toEqual(mockedSyncDate);

      expect(await slave.syncMetadata.getLastPostAt()).toEqual(mockedSyncDate);
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(mockedSyncDate);
    });

    test(".sync (post) with conflict (use ignore strategy) 2", async () => {
      const mockedSyncDate: Date = new Date("2030/01/01");

      await slave.syncBatch([
        makeItem(123, "2025/01/01"),
        makeItem(124, "2028/01/01")
      ]);
      await master.syncBatch([makeItem(123, "2026/01/01")]);
      await slave.sync(SyncOperation.Post, 100, makeOpts({ conflictStrategy: SyncConflictStrategy.Ignore }), mockedSyncDate);
      expect((await slave.findByIds([123]))[0]?.updatedAt).toEqual(new Date("2025/01/01"));

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(2); // ignored + sync
      expect(slave.lastSynchronizer?.conflictItems).toHaveLength(0);
      expect(slave.lastSynchronizer?.successfullyCommitted).toBe(true);
      expect(slave.lastSynchronizer?.itemsToSync.map(x => x.id).sort()).toEqual([123, 124]);

      // TODO: Should it force master to rewrite its data?
      // Updated to "today" (becomes the most recent update in the collection, because it's basically a conflict resolution)
      // Similar to what happens when a conflict fix in Git creates a brand new commit.
      expect(await isHighestDateInCollection((await master.findByIds([123]))[0]?.updatedAt, master)).toBe(true);

      // Doesn't need to update any date, because it was not a conflict, so just COPY the date from the posted item.
      expect((await master.findByIds([124]))[0]?.updatedAt).toEqual(new Date("2028/01/01"));

      // NOTE: Latest post date is updated even if one is ignored.
      //       In this case, ignored item is NOT the last one to be synced.
      //       The reason why this is OK, is because a full sync consists of both post and fetch,
      //       and at first, the conflict strategy must be set to error. Only after, the user should
      //       manually pick which data to keep (local, or server) and then set the flags accordingly
      //       so that one is ignored, and the other one is forced. It's similar to a git merge
      //       and then manually fixing conflicts.
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(mockedSyncDate);

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

    // TODO: Add more similar examples. Add examples with multiple slaves, etc.
    // NOTE: Really verbose, but keep it because it helped me fix a massive bug.
    test("real life bi-directional example", async () => {
      expect(await master.countAll()).toEqual(2);
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/02/01"));

      // Master originally has:
      // makeItem("chris123", "2020/01/01"), 
      // makeItem("marisel34", "2020/06/01") <---- this one also will be synced
      await master.syncBatch([makeItem(1, "2020/02/01")]); // No
      await master.syncBatch([makeItem(2, "2020/02/02")]); // Yes
      await master.syncBatch([makeItem(3, "2020/02/03")]); // Yes
      await master.syncBatch([makeItem(4, "2020/02/04")]); // Yes
      await master.syncBatch([makeItem(5, "2020/02/05")]); // Yes

      expect(await slave.needsSync(SyncOperation.Post)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true);

      await slave.sync(SyncOperation.Fetch, 100);

      // Considers the initial documents added in the mock.
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(5);
      expect(slave.lastSynchronizer?.ignoredItems).toHaveLength(0);
      expect((await slave.findByIds([2]))[0].updatedAt).toEqual(new Date("2020/02/02"));
      expect((await slave.findByIds([3]))[0].updatedAt).toEqual(new Date("2020/02/03"));
      expect((await slave.findByIds([4]))[0].updatedAt).toEqual(new Date("2020/02/04"));
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2001/02/01")); // Default.

      await slave.sync(SyncOperation.Post, 100);
      expect(slave.lastSynchronizer?.ignoredItems).toHaveLength(5);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(0);
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/06/01")); // the default item

      // Last post date does not change, because all items that were going to be posted actually
      // got ignored and weren't dispatched to the collection. When solving a conflict using Ignore,
      // items are re-posted so that their date becomes new, but there are no conflicts here, so they
      // are ignored AND not dispatched at all.
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2001/02/01"));

      expect(slave.lastSynchronizer?.syncStatus).toBe(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.successfullyCommitted).toBe(true);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Post)).toBe(true); // True because it doesn't perform a full check discarding identical objects. It only checks dates.

      let itemsToPost = await slave.itemsToSync(SyncOperation.Post, 100);
      expect(itemsToPost).toHaveLength(5); // Same reason as to why needsSync returns true.

      await master.syncBatch([makeItem(6, "2020/06/02")]);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true);

      await slave.sync(SyncOperation.Fetch, 100);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(1);
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);

      expect(await slave.needsSync(SyncOperation.Post)).toBe(true);
      itemsToPost = await slave.itemsToSync(SyncOperation.Post, 100);
      expect(itemsToPost).toHaveLength(6);
      expect(itemsToPost[0].updatedAt).toEqual(new Date("2020/02/02"));
      let itemsInMaster = await master.findByIds(itemsToPost.map(x => x.id));

      // But they are actually equal. So they should be ignored (needsSync doesn't do that yet).
      expect(itemsToPost.map(x => x.updatedAt).sort()).toEqual(itemsInMaster.map(x => x.updatedAt).sort());

      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/06/02"));
      expect((await master.latestUpdatedItem())?.updatedAt).toEqual(new Date("2020/06/02"));

      const newOwnItem = makeItem(7777, "2020/11/05");
      await slave.syncBatch([newOwnItem]);
      expect((await master.latestUpdatedItem())?.updatedAt).toEqual(new Date("2020/06/02"));
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/06/02"));
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(false);
      expect(await slave.needsSync(SyncOperation.Post)).toBe(true);

      await slave.sync(SyncOperation.Post, 100);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(1);
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/06/02"));
      expect(await slave.syncMetadata.getLastPostAt()).toEqual(new Date("2020/11/05"));
      expect((await master.latestUpdatedItem())?.updatedAt).toEqual(new Date("2020/11/05"));
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true); // Last fetch was a long time ago.
      expect(await slave.needsSync(SyncOperation.Post)).toBe(false);

      // Fetch was a long time ago, but actually, the only thing to fetch, is
      // an item that this location posted, so it gets omitted and the resulting synced items count is 0.
      await slave.sync(SyncOperation.Fetch, 100);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(0);
      expect(await slave.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
      await slave.sync(SyncOperation.Post, 100);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(0);
      expect(await slave.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);

      await slave.sync(SyncOperation.Fetch, 100);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(0);
      expect(await slave.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);

      await slave.sync(SyncOperation.Post, 100);
      expect(await slave.lastSynchronizer?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
      expect(slave.lastSynchronizer?.itemsToSync).toHaveLength(0);

      expect((await master.latestUpdatedItem())?.updatedAt).toEqual(new Date("2020/11/05"));

      // A "true" fetch (i.e. with actual changes) has not been performed, so the fetch date is not updated.
      expect(await slave.syncMetadata.getLastFetchAt()).toEqual(new Date("2020/06/02"));

      // Based on checking only dates (master has a more recent item).
      expect(await slave.needsSync(SyncOperation.Fetch)).toBe(true);
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
