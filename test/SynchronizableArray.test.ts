import SynchronizableCollection from "../src/SynchronizableCollection";
import SynchronizableArray from "../src/example-implementations/SynchronizableArray";
import ParentNotSetError from "../src/exceptions/ParentNotSetError";
import UpdateNewerItemError from "../src/exceptions/UpdateNewerItemError";
import PersonItem from "../src/example-implementations/PersonItem";
import DocId from "../src/types/DocId";
import { SyncOperation } from "../src/types/SyncTypes";
import { SyncConflictStrategy } from "../src/types/SyncTypes";
import BasicSyncMetadata from "../src/example-implementations/BasicSyncMetadata";

function makeItem(id: DocId, date: string): PersonItem{
  return new PersonItem(id, { name: "a", age: 20 }, new Date(date));
}

const personItems: PersonItem[] = [
  makeItem("chris123", "2020/01/01"),
  makeItem("marisel34", "2020/06/01")
];

// Note that most of the code uses polymorphism and is implementation agnostic, meaning that
// this same test might be used for other implementations.
let slaveSyncArray: SynchronizableCollection;
let masterSyncArray: SynchronizableCollection;
let syncArrayManyItems: SynchronizableCollection;

const initializeMock = () => {
  const syncMetadata = new BasicSyncMetadata(new Date("2020/02/01"), new Date("2001/02/01"));
  slaveSyncArray = new SynchronizableArray([], syncMetadata);
  masterSyncArray = new SynchronizableArray(personItems);
  
  slaveSyncArray.parent = masterSyncArray;

  syncArrayManyItems = new SynchronizableArray([
    makeItem(1, "2020/01/01"),
    makeItem(2, "2015/06/01"),
    makeItem(3, "2018/06/01"),
    makeItem(4, "2016/06/01"),
    makeItem(5, "2021/06/01")
  ]);
};

describe("SynchronizableArray", () => {
  beforeEach(initializeMock);

  test(".array (initial constructor)", async () => {
    expect(slaveSyncArray.countAll()).toEqual(0);
    expect(masterSyncArray.countAll()).toEqual(2);
  });
  
  test(".needsSync (fetch)", async () => {
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();
    expect(await masterSyncArray.needsSync(SyncOperation.Fetch)).toBeFalsy();
  });
  
  test(".itemsToSync (fetch)", async () => {
    expect(await slaveSyncArray.itemsToSync(SyncOperation.Fetch)).toHaveLength(1);
    await expect(async () => { await masterSyncArray.itemsToSync(SyncOperation.Fetch) })
    .rejects
    .toThrow(ParentNotSetError);
  });

  test(".needsSync (fetch)", async () => {
    await slaveSyncArray.sync(SyncOperation.Fetch);
    expect(await slaveSyncArray.findById(personItems[1].id)).toBe(personItems[1]);
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeFalsy();
  });

  test(".sync (fetch) with conflict", async () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();

    let err: any;
    try{
      await slaveSyncArray.sync(SyncOperation.Fetch);
    } catch (e){
      err = e;
    }

    expect(err).toBeInstanceOf(UpdateNewerItemError);
    expect(err.id).toEqual("marisel34");
  });

  test(".sync (fetch) with conflict (use parent data)", async () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Fetch, { conflictStrategy: SyncConflictStrategy.Force });

    // Uses parent data.
    expect((await slaveSyncArray.findById("marisel34"))?.updatedAt).toEqual(new Date("2020/06/01"));
  });

  test(".sync (fetch) with conflict (use ignore strategy)", async () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Fetch, { conflictStrategy: SyncConflictStrategy.Ignore });
    expect((await slaveSyncArray.findById("marisel34"))?.updatedAt).toEqual(new Date("2028/06/01"));
  });

  test(".needsSync (post)", async () => {
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    slaveSyncArray.upsert(makeItem(123, "2026/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();
  });

  test(".sync (post)", async () => {
    expect(slaveSyncArray.countAll()).toEqual(0);
    expect(masterSyncArray.countAll()).toEqual(2);
    slaveSyncArray.upsert(makeItem(1231, "2026/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Post);
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    expect(await slaveSyncArray.syncMetadata.getLastPostAt()).toEqual(new Date("2026/01/01"));

    slaveSyncArray.upsert(makeItem(1232, "2027/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Post);
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    expect(await slaveSyncArray.syncMetadata.getLastPostAt()).toEqual(new Date("2027/01/01"));
    expect(slaveSyncArray.countAll()).toEqual(2);
    expect(masterSyncArray.countAll()).toEqual(4);
  });

  test(".sync (post) corrupted updatedAt does not get posted", async () => {
    expect(slaveSyncArray.countAll()).toEqual(0);
    expect(masterSyncArray.countAll()).toEqual(2);
    slaveSyncArray.upsert(makeItem(123, "1995/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    await slaveSyncArray.sync(SyncOperation.Post);
    expect(slaveSyncArray.countAll()).toEqual(1);
    expect(masterSyncArray.countAll()).toEqual(2);
  });

  test(".sync (post) with conflict", async () => {
    slaveSyncArray.upsert(makeItem(121, "2025/02/01"));
    slaveSyncArray.upsert(makeItem(122, "2025/03/01"));
    slaveSyncArray.upsert(makeItem(123, "2025/04/01"));
    slaveSyncArray.upsert(makeItem(124, "2025/05/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();

    await expect(async () => { await slaveSyncArray.sync(SyncOperation.Post) })
    .rejects
    .toThrow(UpdateNewerItemError);

    expect(await slaveSyncArray.syncMetadata.getLastPostAt()).toEqual(new Date("2025/03/01"));
  });

  test(".sync (post) with conflict (use slave data)", async () => {
    slaveSyncArray.upsert(makeItem(123, "2025/01/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    await slaveSyncArray.sync(SyncOperation.Post, { conflictStrategy: SyncConflictStrategy.Force });
    expect((await slaveSyncArray.findById(123))?.updatedAt).toEqual(new Date("2025/01/01"));
    expect((await masterSyncArray.findById(123))?.updatedAt).toEqual(new Date("2025/01/01"));
  });

  test(".sync (post) with conflict (use ignore strategy)", async () => {
    slaveSyncArray.upsert(makeItem(123, "2025/01/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    await slaveSyncArray.sync(SyncOperation.Post, { conflictStrategy: SyncConflictStrategy.Ignore });
    // NOTE: latest post date is updated even if one is ignored.
    expect(await slaveSyncArray.syncMetadata.getLastPostAt()).toEqual(new Date("2025/01/01"));
  });

  test(".sync (post) with conflict (use ignore strategy)", async () => {
    slaveSyncArray.upsert(makeItem(123, "2025/01/01"));
    slaveSyncArray.upsert(makeItem(124, "2028/01/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    await slaveSyncArray.sync(SyncOperation.Post, { conflictStrategy: SyncConflictStrategy.Ignore });
    expect((await slaveSyncArray.findById(123))?.updatedAt).toEqual(new Date("2025/01/01"));
    expect((await masterSyncArray.findById(123))?.updatedAt).toEqual(new Date("2026/01/01"));

    // NOTE: Latest post date is updated even if one is ignored.
    //       In this case, ignored item is NOT the last one to be synced.
    //       The reason why this is OK, is because a full sync consists of both post and fetch,
    //       and at first, the conflict strategy must be set to error. Only after, the user should
    //       manually pick which data to keep (local, or server) and then set the flags accordingly
    //       so that one is ignored, and the other one is forced. It's similar to a git merge
    //       and then manually fixing conflicts.
    expect(await slaveSyncArray.syncMetadata.getLastPostAt()).toEqual(new Date("2028/01/01"));
    expect((await slaveSyncArray.latestUpdatedItem())?.updatedAt).toEqual(new Date("2028/01/01"));
  });

  test(".itemsNewerThan (result sorted by date ASC)", async () => {
    const itemIds = await syncArrayManyItems.itemsNewerThan(new Date("2015/06/02"));

    expect(itemIds.map(i => i.id)).toEqual([4, 3, 1, 5]);
  });
});
