import SynchronizableCollection from "../../src/SynchronizableCollection";
import SyncItem from "../../src/SyncItem";
import DocId from "../../src/types/DocId";
import { SyncConflictStrategy, SyncOperation } from "../../src/types/SyncTypes";
import * as R from "ramda";
import Synchronizer from "../../src/Synchronizer";

class DummySyncItem extends SyncItem {
  constructor(id: DocId, doc: string, currentDate: Date) {
    const finalDocument = {
      content: doc
    }
    super(id, finalDocument, currentDate);
  }
}

// TODO: Needs some modifications to be able to use with NeDB.
//       For example it seems Jest compares the _id when checking if documents are equal.
class Mock {
  private _currentDate: Date;
  private _slaves: SynchronizableCollection[] = [];
  private _master: SynchronizableCollection;
  private _lastSync?: Synchronizer;

  get slaves(): SynchronizableCollection[] {
    return this._slaves;
  }

  get lastSync(): Synchronizer | undefined {
    return this._lastSync;
  }

  get master(): SynchronizableCollection {
    return this._master;
  }

  constructor(master: SynchronizableCollection) {
    this._master = master;
    this._currentDate = new Date("2000/01/01");
  }

  async initializeAllCollections(): Promise<void> {
    await this._master.initialize();
    for (let i = 0; i < this._slaves.length; i++) {
      await this._slaves[i].initialize();
    }
  }

  async directMasterUpdate(id: DocId, doc: string): Promise<void> {
    this.setNextDate();
    const item = new DummySyncItem(id, doc, this._currentDate);
    await this._master.syncBatch([item]);
  }

  async syncSlaveItem(slaveIdx: number, id: DocId, doc: string): Promise<void> {
    this.setNextDate();
    const item = new DummySyncItem(id, doc, this._currentDate);
    const slave = this._slaves[slaveIdx];
    await slave.syncBatch([item]);
  }

  async post(slaveIdx: number, limit: number = 10000): Promise<void> {
    const slave = this._slaves[slaveIdx];
    await slave.sync(SyncOperation.Post, limit, { conflictStrategy: SyncConflictStrategy.RaiseError });
    this._lastSync = slave.lastSynchronizer;
  }

  async postForce(slaveIdx: number, limit: number = 10000): Promise<void> {
    const slave = this._slaves[slaveIdx];
    await slave.sync(SyncOperation.Post, limit, { conflictStrategy: SyncConflictStrategy.Force });
    this._lastSync = slave.lastSynchronizer;
  }

  async fetch(slaveIdx: number, limit: number = 10000): Promise<void> {
    const slave = this._slaves[slaveIdx];
    await slave.sync(SyncOperation.Fetch, limit, { conflictStrategy: SyncConflictStrategy.RaiseError });
    this._lastSync = slave.lastSynchronizer;
  }

  async fetchUseMaster(slaveIdx: number, limit: number = 10000): Promise<void> {
    const slave = this._slaves[slaveIdx];
    await slave.sync(SyncOperation.Fetch, limit, { conflictStrategy: SyncConflictStrategy.Force });
    this._lastSync = slave.lastSynchronizer;
  }

  async fetchUseLocal(slaveIdx: number, limit: number = 10000): Promise<void> {
    const slave = this._slaves[slaveIdx];
    await slave.sync(SyncOperation.Fetch, limit, { conflictStrategy: SyncConflictStrategy.Ignore });
    this._lastSync = slave.lastSynchronizer;
  }

  /** Verifies that all documents in all databases have the same content,
   * it does not verify that all `updatedAt` are the same.
   */
  async allCollectionsSameDocumentContent(): Promise<boolean> {
    for (let i = 0; i < this._slaves.length; i++) {
      const same = await this.slaveSameDocumentContentAsMaster(i);
      if (!same) return false;
    }
    return true;
  }

  /** Verifies that a slave has same documents as parent, based on content, not on `updatedAt`
   * (which is ignored). */
  private async slaveSameDocumentContentAsMaster(slaveIdx: number): Promise<boolean> {
    const masterDocuments = await this.masterDocuments();
    const items = await this.slaveDocuments(slaveIdx);
    return R.equals(masterDocuments, items);
  }

  addSlave(slave: SynchronizableCollection) {
    this._slaves.push(slave);
    slave.parent = this._master;
  }

  async masterDocuments(): Promise<SyncItem[]> {
    return await this.collectionDocuments(this._master);
  }

  async masterDocIds(): Promise<DocId[]> {
    return (await this.masterDocuments()).map(x => x.id);
  }

  async slaveDocuments(slaveIdx: number): Promise<SyncItem[]> {
    const slave = this._slaves[slaveIdx];
    return await this.collectionDocuments(slave);
  }

  async slaveDocIds(slaveIdx: number): Promise<DocId[]> {
    return (await this.slaveDocuments(slaveIdx)).map(x => x.id);
  }

  private async collectionDocuments(collection: SynchronizableCollection): Promise<SyncItem[]> {
    // Be careful of hardcoded dates. This assumes that all data is newer than year 1900.
    const result = await collection.itemsNewerThan(new Date("1900/01/01"), 100000);
    return result.map((item: SyncItem) => new DummySyncItem(item.id, item.document.content, item.updatedAt));
  }

  /** Increase date to make it future from current. */
  private setNextDate(): void {
    this._currentDate = new Date(this._currentDate.getTime() + 100);
  }
}

export default Mock;
