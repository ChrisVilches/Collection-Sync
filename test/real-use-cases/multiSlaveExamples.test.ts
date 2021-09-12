import SynchronizableArray from "../../src/example-implementations/SynchronizableArray";
import SyncStatus from "../../src/types/SyncStatus";
import Mock from "./Mock";

// Some stuff can be simplified (to make it less verbose).

let mock: Mock;

describe("multi slave examples", () => {
  beforeEach(async () => {
    const master = new SynchronizableArray();
    mock = new Mock(master);

    mock.addSlave(new SynchronizableArray());
    mock.addSlave(new SynchronizableArray());
    await mock.initializeAllCollections();
  });

  test("(simple) slave fetches data from master (without conflicts)", async () => {
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.directMasterUpdate(1, "first document");

    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    expect(await mock.masterDocIds()).toEqual([1]);
    expect(await mock.slaveDocuments(0)).toHaveLength(0);
    expect(await mock.slaveDocuments(1)).toHaveLength(0);
    await mock.fetch(0);

    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    expect(await mock.masterDocIds()).toEqual([1]);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toHaveLength(0);

    await mock.fetch(1);

    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);
    expect(await mock.masterDocIds()).toEqual([1]);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());

    await mock.directMasterUpdate(2, "second document");

    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    expect(await mock.masterDocIds()).toEqual([1, 2]);
    expect(await mock.slaveDocIds(0)).toEqual([1]);
    expect(await mock.slaveDocIds(1)).toEqual([1]);

    await mock.fetch(0);

    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    expect(await mock.masterDocIds()).toEqual([1, 2]);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocIds(1)).toEqual([1]);

    await mock.fetch(1);

    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);
    expect(await mock.masterDocIds()).toEqual([1, 2]);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
  });

  test("same document is updated and fetched many times", async () => {
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.directMasterUpdate(1, "first document");
    await mock.fetch(0);

    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocIds(1)).toHaveLength(0);

    await mock.directMasterUpdate(1, "first document v2");

    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocIds(1)).toHaveLength(0);

    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());

    await mock.directMasterUpdate(1, "first document v2");
    expect(await mock.slaveDocuments(0)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());

    await mock.directMasterUpdate(1, "first document v3");
    expect(await mock.slaveDocuments(0)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());

    await mock.directMasterUpdate(1, "first document v4");
    expect(await mock.slaveDocuments(0)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());

    await mock.fetch(0);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());
    await mock.fetch(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());

    expect(await mock.masterDocIds()).toHaveLength(1);
  });

  test("slave 2 fetches document posted by slave 1", async () => {
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocuments(0)).toHaveLength(0);
    expect(await mock.slaveDocuments(1)).toHaveLength(0);
    await mock.syncSlaveItem(0, 1, "first document");
    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocuments(0)).toHaveLength(1);
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.post(0);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toHaveLength(1);
    expect(await mock.slaveDocuments(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);
  });

  test("slave 2 fetches document posted by slave 1, but slave 2 has a document (non-conflict) at the moment of fetching", async () => {
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocuments(0)).toHaveLength(0);
    expect(await mock.slaveDocuments(1)).toHaveLength(0);
    await mock.syncSlaveItem(0, 1, "first document");
    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocuments(0)).toHaveLength(1);
    expect(await mock.slaveDocuments(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.post(0);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.syncSlaveItem(1, 2, "some other non-conflicting document");
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toHaveLength(1);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toHaveLength(2);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.post(1);
    expect(await mock.masterDocIds()).toHaveLength(2);
    expect(await mock.slaveDocuments(0)).toHaveLength(1);
    expect(await mock.slaveDocuments(1)).toHaveLength(2);
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.fetch(0);
    expect(await mock.masterDocIds()).toHaveLength(2);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);
  });

  xtest("both slaves create their own version of a document, and try to post", () => {

  });

  test("both slaves have a document fetched from post, both modify it, and try to post", async () => {
    await mock.directMasterUpdate(111, "first document");
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocuments()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);

    // Both slaves modify the same document.

    await mock.syncSlaveItem(0, 111, "first document modified by slave 1");
    await mock.syncSlaveItem(1, 111, "first document modified by slave 2");

    // This is to check that collections have unique documents (make sure references to same object don't exist).

    expect((await mock.masterDocuments())[0].document.content).toEqual("first document");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // Only the first slave who pushes first won't get any conflict.
    // (In practice, it should fetch first).

    await mock.post(0);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");
    expect(await mock.masterDocuments()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toHaveLength(1);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);

    // Must fetch first (like in Git), but fetch returns conflict, so it must decide what to do.

    await mock.fetch(1);
    expect(mock.lastSync?.conflictItems).toHaveLength(1);
    expect(mock.lastSync?.itemsToSync).toHaveLength(0);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.Conflict);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // Chooses the "use local" approach to resolve conflicts.

    await mock.fetchUseLocal(1);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect(mock.lastSync?.itemsToSync).toHaveLength(1); // Items from master are ignored.
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2"); // Keeps local item.

    await mock.post(1);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect(mock.lastSync?.itemsToSync).toHaveLength(1);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // Then update first slave using a similar approach.

    await mock.fetch(0);
    expect(mock.lastSync?.conflictItems).toHaveLength(1);
    expect(mock.lastSync?.itemsToSync).toHaveLength(0);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.Conflict);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    await mock.fetchUseMaster(0);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect(mock.lastSync?.itemsToSync).toHaveLength(1); // Item from master is not ignored, because it uses master data.
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");
  });

  test("both slaves have a document fetched from post, both modify it, and try to post, but both prioritize local data", async () => {
    await mock.directMasterUpdate(111, "first document");
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocuments()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toEqual(await mock.masterDocuments());
    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);

    // Both slaves modify the same document.

    await mock.syncSlaveItem(0, 111, "first document modified by slave 1");
    await mock.syncSlaveItem(1, 111, "first document modified by slave 2");

    // This is to check that collections have unique documents (make sure references to same object don't exist).

    expect((await mock.masterDocuments())[0].document.content).toEqual("first document");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // Only the first slave who pushes first won't get any conflict.
    // (In practice, it should fetch first).

    await mock.post(0);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");
    expect(await mock.masterDocuments()).toHaveLength(1);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).not.toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocuments(1)).toHaveLength(1);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);

    // Must fetch first (like in Git), but fetch returns conflict, so it must decide what to do.

    await mock.fetch(1);
    expect(mock.lastSync?.conflictItems).toHaveLength(1);
    expect(mock.lastSync?.itemsToSync).toHaveLength(0);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.Conflict);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // Chooses the "use local" approach to resolve conflicts.

    await mock.fetchUseLocal(1);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect(mock.lastSync?.itemsToSync).toHaveLength(1); // Rewrites its own items, with a new date.
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2"); // Keeps local item.

    // Now it can post (after fetch).

    await mock.postForce(1);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect(mock.lastSync?.itemsToSync).toHaveLength(1);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // Then update first slave using a similar approach.

    await mock.fetch(0);
    expect(mock.lastSync?.conflictItems).toHaveLength(1);
    expect(mock.lastSync?.itemsToSync).toHaveLength(0);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.Conflict);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    // From here, it's different from the above test.

    await mock.fetchUseLocal(0);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 2");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    await mock.postForce(0);
    expect(mock.lastSync?.conflictItems).toHaveLength(0);
    expect(mock.lastSync?.ignoredItems).toHaveLength(0);
    expect(mock.lastSync?.itemsToSync).toHaveLength(1);
    expect(mock.lastSync?.syncStatus).toEqual(SyncStatus.PreCommitDataTransmittedSuccessfully);
    expect((await mock.masterDocuments())[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(0))[0].document.content).toEqual("first document modified by slave 1");
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 2");

    await mock.fetchUseMaster(1);
    expect((await mock.slaveDocuments(1))[0].document.content).toEqual("first document modified by slave 1");
  });
});
