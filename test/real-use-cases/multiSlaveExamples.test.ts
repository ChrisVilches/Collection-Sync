import SynchronizableArray from "../../src/example-implementations/SynchronizableArray";
import Mock from "./Mock";

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
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.fetch(0);

    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    expect(await mock.masterDocIds()).toEqual([1]);
    expect(await mock.slaveDocuments(0)).toEqual(await mock.masterDocuments());
    expect(await mock.slaveDocIds(1)).toHaveLength(0);

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
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.syncSlaveItem(0, 1, "first document");
    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.post(0);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(1);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);
  });

  test("slave 2 fetches document posted by slave 1, but slave 2 has a document (non-conflict) at the moment of fetching", async () => {
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocIds(0)).toHaveLength(0);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    await mock.syncSlaveItem(0, 1, "first document");
    await mock.fetch(0);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(0);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.post(0);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(0);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.syncSlaveItem(1, 2, "some other non-conflicting document");
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(1);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.fetch(1);
    expect(await mock.masterDocIds()).toHaveLength(1);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(2);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.post(1);
    expect(await mock.masterDocIds()).toHaveLength(2);
    expect(await mock.slaveDocIds(0)).toHaveLength(1);
    expect(await mock.slaveDocIds(1)).toHaveLength(2);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(false);
    await mock.fetch(0);
    expect(await mock.masterDocIds()).toHaveLength(2);
    expect(await mock.slaveDocIds(0)).toHaveLength(2);
    expect(await mock.slaveDocIds(1)).toHaveLength(2);
    expect(await mock.allCollectionsSameDocumentContent()).toBe(true);
  });

  xtest("both slaves create their own version of a document, and try to post", () => {

  });

  xtest("both slaves have a document fetched from post, both modify it, and try to post", () => {

  });
});
