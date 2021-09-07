import SynchronizableArray from "../src/SynchronizableArray";
import ParentNotSetError from "../src/exceptions/ParentNotSetError";
import LocalItemNewerThanParentItemError from "../src/exceptions/LocalItemNewerThanParentItemError";
import PersonItem from "../src/PersonItem";
import { UpdateFromParentConflictStrategy } from "../src/types/UpdateFromParent";

const personItems: PersonItem[] = [
  new PersonItem("chris123", { name: "Christopher", age: 29 }, new Date("2020/01/01")),
  new PersonItem("marisel34", { name: "Marisel", age: 28 }, new Date("2020/06/01"))
];

const newerItem: PersonItem = new PersonItem("marisel34", { name: "Marisel", age: 28 }, new Date("2022/06/01"));

let slaveSyncArray: SynchronizableArray;
let masterSyncArray: SynchronizableArray;
let syncArrayManyItems: SynchronizableArray;

const initializeMock = () => {
  slaveSyncArray = new SynchronizableArray([]);
  masterSyncArray = new SynchronizableArray(personItems);
  
  slaveSyncArray.parent = masterSyncArray;
  slaveSyncArray.lastSyncAt = new Date("2020/02/01");

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
    slaveSyncArray.upsert(newerItem);
    expect(slaveSyncArray.needsFetchFromParent()).toBeTruthy();

    let err: any;
    try{
      slaveSyncArray.updateFromParent();
    } catch (e){
      err = e;
    }

    expect(err).toBeInstanceOf(LocalItemNewerThanParentItemError);
    expect(err.id).toEqual("marisel34");
  });

  test(".updateFromParent with conflict (use parent data)", () => {
    slaveSyncArray.upsert(newerItem);
    expect(slaveSyncArray.needsFetchFromParent()).toBeTruthy();
    slaveSyncArray.updateFromParent({ conflictStrategy: UpdateFromParentConflictStrategy.UseParentData });

    // Uses parent data.
    expect(slaveSyncArray.array[0].updatedAt).toEqual(new Date("2020/06/01"));
  });

  test(".itemsNewerThan (result sorted by date ASC)", () => {
    const itemIds = syncArrayManyItems.itemsNewerThan(new Date("2015/06/02"))
                                      .map(i => i.id);

    expect(itemIds).toEqual([4, 3, 1, 5]);
  });
});
