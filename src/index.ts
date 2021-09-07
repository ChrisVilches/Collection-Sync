import SynchronizableArray from "./SynchronizableArray";
import PersonItem from "./PersonItem";

console.log("Hello world");

const personItems: PersonItem[] = [
  new PersonItem("chris123", { name: "Christopher", age: 29 }, new Date("2020/01/01")),
  new PersonItem("marisel34", { name: "Marisel", age: 28 }, new Date("2020/06/01"))
];

const slaveSyncArray: SynchronizableArray = new SynchronizableArray([]);
const masterSyncArray: SynchronizableArray = new SynchronizableArray(personItems);

console.log("Slave:", slaveSyncArray.findAll().map(x => x.toObject()));
console.log("Master:", masterSyncArray.findAll().map(x => x.toObject()));

slaveSyncArray.parent = masterSyncArray;
slaveSyncArray.lastSyncAt = new Date("2020/02/01");

console.log("Does slave need to fetch from master?", slaveSyncArray.needsFetchFromParent())

console.log("The items that the slave must fetch from master are:", slaveSyncArray.itemsToFetchFromParent())

console.log("Updating from parent...")

slaveSyncArray.updateFromParent();

console.log("After slave <- master update");

console.log("Slave:", slaveSyncArray.findAll().map(x => x.toObject().toJS()));
console.log("Master:", masterSyncArray.findAll().map(x => x.toObject().toJS()));
