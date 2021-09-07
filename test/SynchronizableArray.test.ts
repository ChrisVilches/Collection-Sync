import SynchronizableArray from "../src/SynchronizableArray";
import ParentNotSetError from "../src/exceptions/ParentNotSetError";
import UpdateNewerItemError from "../src/exceptions/UpdateNewerItemError";
import PersonItem from "../src/PersonItem";
import DocId from "../src/types/DocId";
import { SyncConflictStrategy } from "../src/types/SyncTypes";

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
  slaveSyncArray = new SynchronizableArray([]);
  masterSyncArray = new SynchronizableArray(personItems);
  
  slaveSyncArray.parent = masterSyncArray;
  slaveSyncArray.lastFetchAt = new Date("2020/02/01");
  slaveSyncArray.lastPostAt = new Date("2001/02/01");

  syncArrayManyItems = new SynchronizableArray([
    new PersonItem(1, { name: "a", age: 15 }, new Date("2020/01/01")),
    new PersonItem(2, { name: "b", age: 16 }, new Date("2015/06/01")),
    new PersonItem(3, { name: "c", age: 17 }, new Date("2018/06/01")),
    new PersonItem(4, { name: "d", age: 18 }, new Date("2016/06/01")),
    new PersonItem(5, { name: "e", age: 19 }, new Date("2021/06/01"))
  ]);
};

describe("SynchronizableArray", () => {
  beforeEach(initializeMock);

  test(".array (initial constructor)", () => {
    expect(slaveSyncArray.array).toHaveLength(0);
    expect(masterSyncArray.array).toHaveLength(2);
  });
  
  test(".needsFetchFromParent", () => {
    expect(slaveSyncArray.needsFetchFromParent()).toBeTruthy();
    expect(masterSyncArray.needsFetchFromParent()).toBeFalsy();
  });
  
  test(".itemsToFetchFromParent", () => {
    expect(slaveSyncArray.itemsToFetchFromParent()).toHaveLength(1);
    expect(() => { masterSyncArray.itemsToFetchFromParent() }).toThrow(ParentNotSetError);
  });

  test(".updateFromParent", () => {
    slaveSyncArray.updateFromParent();
    expect(slaveSyncArray.array[0]).toBe(personItems[1]);
    expect(slaveSyncArray.needsFetchFromParent()).toBeFalsy();
  });

  test(".updateFromParent with conflict", () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(slaveSyncArray.needsFetchFromParent()).toBeTruthy();

    let err: any;
    try{
      slaveSyncArray.updateFromParent();
    } catch (e){
      err = e;
    }

    expect(err).toBeInstanceOf(UpdateNewerItemError);
    expect(err.id).toEqual("marisel34");
  });

  test(".updateFromParent with conflict (use parent data)", () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(slaveSyncArray.needsFetchFromParent()).toBeTruthy();
    slaveSyncArray.updateFromParent({ conflictStrategy: SyncConflictStrategy.Force });

    // Uses parent data.
    expect(slaveSyncArray.array[0].updatedAt).toEqual(new Date("2020/06/01"));
  });

  test(".updateFromParent with conflict (use ignore strategy)", () => {
    slaveSyncArray.upsert(makeItem("marisel34", "2028/06/01"));
    expect(slaveSyncArray.needsFetchFromParent()).toBeTruthy();
    slaveSyncArray.updateFromParent({ conflictStrategy: SyncConflictStrategy.Ignore });
    expect(slaveSyncArray.array[0].updatedAt).toEqual(new Date("2028/06/01"));
  });

  test(".needsToUpdateParent", () => {
    expect(slaveSyncArray.needsToUpdateParent()).toBeFalsy();
    slaveSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2026/01/01")));
    expect(slaveSyncArray.needsToUpdateParent()).toBeTruthy();
  });

  test(".updateParent", () => {
    expect(slaveSyncArray.array).toHaveLength(0);
    expect(masterSyncArray.array).toHaveLength(2);
    slaveSyncArray.upsert(new PersonItem(1231, { name: "x", age: 50 }, new Date("2026/01/01")));
    expect(slaveSyncArray.needsToUpdateParent()).toBeTruthy();
    slaveSyncArray.updateParent();
    expect(slaveSyncArray.needsToUpdateParent()).toBeFalsy();

    slaveSyncArray.upsert(new PersonItem(1232, { name: "x", age: 50 }, new Date("2027/01/01")));
    expect(slaveSyncArray.needsToUpdateParent()).toBeTruthy();
    slaveSyncArray.updateParent();
    expect(slaveSyncArray.needsToUpdateParent()).toBeFalsy();
    expect(slaveSyncArray.array).toHaveLength(2);
    expect(masterSyncArray.array).toHaveLength(4);
  });

  test(".updateParent corrupted updatedAt does not get posted", () => {
    expect(slaveSyncArray.array).toHaveLength(0);
    expect(masterSyncArray.array).toHaveLength(2);
    slaveSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("1995/01/01")));
    expect(slaveSyncArray.needsToUpdateParent()).toBeFalsy();
    slaveSyncArray.updateParent();
    expect(slaveSyncArray.array).toHaveLength(1);
    expect(masterSyncArray.array).toHaveLength(2);
  });

  test(".updateParent with conflict", () => {
    slaveSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2025/01/01")));
    masterSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2026/01/01")));
    expect(slaveSyncArray.needsToUpdateParent()).toBeTruthy();
    expect(() => { slaveSyncArray.updateParent() }).toThrowError(UpdateNewerItemError);
  });

  test(".updateParent with conflict (use slave data)", () => {
    slaveSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2025/01/01")));
    masterSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2026/01/01")));
    slaveSyncArray.updateParent({ conflictStrategy: SyncConflictStrategy.Force });

    // A little bit verbose.
    expect((slaveSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2025/01/01"));
    expect((masterSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2025/01/01"));
  });

  test(".updateParent with conflict (use ignore strategy)", () => {
    slaveSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2025/01/01")));
    masterSyncArray.upsert(new PersonItem(123, { name: "x", age: 50 }, new Date("2026/01/01")));
    slaveSyncArray.updateParent({ conflictStrategy: SyncConflictStrategy.Ignore });

    // A little bit verbose.
    expect((slaveSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2025/01/01"));
    expect((masterSyncArray.findById(123) as PersonItem).updatedAt).toEqual(new Date("2026/01/01"));
  });

  test(".itemsNewerThan (result sorted by date ASC)", () => {
    const itemIds = syncArrayManyItems.itemsNewerThan(new Date("2015/06/02"))
                                      .map(i => i.id);

    expect(itemIds).toEqual([4, 3, 1, 5]);
  });
});
