import SynchronizableArray from "../src/SynchronizableArray";
import ParentNotSetError from "../src/exceptions/ParentNotSetError";
import UpdateNewerItemError from "../src/exceptions/UpdateNewerItemError";
import PersonItem from "../src/PersonItem";
import DocId from "../src/types/DocId";
import { SyncOperation } from "../src/types/SyncTypes";
import { SyncConflictStrategy } from "../src/types/SyncTypes";
import BasicSyncMetadata from "../src/BasicSyncMetadata";

function makeItem(id: DocId, date: string): PersonItem{
  return new PersonItem(id, { name: "a", age: 20 }, new Date(date));
}

const personItems: PersonItem[] = [
  makeItem("chris123", "2020/01/01"),
  makeItem("marisel34", "2020/06/01")
];

let slaveSyncArray: SynchronizableArray;
let masterSyncArray: SynchronizableArray;
let syncArrayManyItems: SynchronizableArray;

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

  test(".array (initial constructor)", () => {
    expect(slaveSyncArray.array).toHaveLength(0);
    expect(masterSyncArray.array).toHaveLength(2);
  });
  
  test(".needsFetch", async () => {
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();
    expect(await masterSyncArray.needsSync(SyncOperation.Fetch)).toBeFalsy();
  });
  
  test(".itemsToFetch", async () => {
    expect(await slaveSyncArray.itemsToFetch()).toHaveLength(1);
    await expect(async () => { await masterSyncArray.itemsToFetch() })
    .rejects
    .toThrow(ParentNotSetError);
  });

  test(".fetch", async () => {
    await slaveSyncArray.sync(SyncOperation.Fetch);
    expect(slaveSyncArray.array[0]).toBe(personItems[1]);
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeFalsy();
  });

  test(".fetch with conflict", async () => {
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

  test(".fetch with conflict (use parent data)", async () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Fetch, { conflictStrategy: SyncConflictStrategy.Force });

    // Uses parent data.
    expect(slaveSyncArray.array[0].updatedAt).toEqual(new Date("2020/06/01"));
  });

  test(".fetch with conflict (use ignore strategy)", async () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Fetch)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Fetch, { conflictStrategy: SyncConflictStrategy.Ignore });
    expect(slaveSyncArray.array[0].updatedAt).toEqual(new Date("2028/06/01"));
  });

  test(".needsToUpdateParent", async () => {
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    slaveSyncArray.upsert(makeItem(123, "2026/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();
  });

  test(".updateParent", async () => {
    expect(slaveSyncArray.array).toHaveLength(0);
    expect(masterSyncArray.array).toHaveLength(2);
    slaveSyncArray.upsert(makeItem(1231, "2026/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Post);
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();

    slaveSyncArray.upsert(makeItem(1232, "2027/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();
    await slaveSyncArray.sync(SyncOperation.Post);
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    expect(slaveSyncArray.array).toHaveLength(2);
    expect(masterSyncArray.array).toHaveLength(4);
  });

  test(".post corrupted updatedAt does not get posted", async () => {
    expect(slaveSyncArray.array).toHaveLength(0);
    expect(masterSyncArray.array).toHaveLength(2);
    slaveSyncArray.upsert(makeItem(123, "1995/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeFalsy();
    await slaveSyncArray.sync(SyncOperation.Post);
    expect(slaveSyncArray.array).toHaveLength(1);
    expect(masterSyncArray.array).toHaveLength(2);
  });

  test(".post with conflict", async () => {
    slaveSyncArray.upsert(makeItem(123, "2025/01/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    expect(await slaveSyncArray.needsSync(SyncOperation.Post)).toBeTruthy();

    await expect(async () => { await slaveSyncArray.sync(SyncOperation.Post) })
    .rejects
    .toThrow(UpdateNewerItemError);
  });

  test(".post with conflict (use slave data)", async () => {
    slaveSyncArray.upsert(makeItem(123, "2025/01/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    await slaveSyncArray.sync(SyncOperation.Post, { conflictStrategy: SyncConflictStrategy.Force });

    // A little bit verbose.
    expect((slaveSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2025/01/01"));
    expect((masterSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2025/01/01"));
  });

  test(".post with conflict (use ignore strategy)", async () => {
    slaveSyncArray.upsert(makeItem(123, "2025/01/01"));
    masterSyncArray.upsert(makeItem(123, "2026/01/01"));
    await slaveSyncArray.sync(SyncOperation.Post, { conflictStrategy: SyncConflictStrategy.Ignore });

    // A little bit verbose.
    expect((slaveSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2025/01/01"));
    expect((masterSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2026/01/01"));
  });

  test(".itemsNewerThan (result sorted by date ASC)", async () => {
    const itemIds = await syncArrayManyItems.itemsNewerThan(new Date("2015/06/02"));

    expect(itemIds.map(i => i.id)).toEqual([4, 3, 1, 5]);
  });
});
