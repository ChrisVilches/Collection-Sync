import SynchronizableArray from "../src/example-implementations/SynchronizableArray";
import ParentNotSetError from "../src/exceptions/ParentNotSetError";
import UpdateNewerItemError from "../src/exceptions/UpdateNewerItemError";
import PersonItem from "../src/example-implementations/PersonItem";
import DocId from "../src/types/DocId";
import { SyncOperation } from "../src/types/SyncTypes";
import { SyncConflictStrategy } from "../src/types/SyncTypes";
import BasicSyncMetadata from "../src/example-implementations/BasicSyncMetadata";

describe("SynchronizableArray", () => {
  test(".array (initial constructor)", () => {
  });
});
