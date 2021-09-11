import SyncItem from "./SyncItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { SyncOptions, SyncConflictStrategy, SyncOperation } from "./types/SyncTypes";
import DocId from "./types/DocId";
import Collection from "./Collection";
import Synchronizer from "./Synchronizer";
import CollectionSyncMetadata from "./CollectionSyncMetadata";
import SyncPolicy from "./SyncPolicy";

// TODO: Many methods in this class could be private.

abstract class SynchronizableCollection implements Collection {
  private readonly defaultSyncOptions: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  /** Store history of sync operations. */
  private synchronizers: Synchronizer[] = [];

  private _parent?: Collection;

  public syncMetadata: CollectionSyncMetadata;

  constructor(syncMetadata: CollectionSyncMetadata) {
    this.syncMetadata = syncMetadata;
  }

  abstract countAll(): number | Promise<number>;
  abstract findByIds(ids: DocId[]): SyncItem[] | Promise<SyncItem[]>;
  abstract syncBatch(items: SyncItem[]): SyncItem[] | Promise<SyncItem[]>;
  abstract itemsNewerThan(date: Date | undefined, limit: number): SyncItem[] | Promise<SyncItem[]>;
  abstract latestUpdatedItem(): SyncItem | Promise<SyncItem | undefined> | undefined;
  abstract initialize(): Promise<void>;

  /**
   * Executes before starting to send the data to the destination collection.
   * If this method returns `false`, syncing will be aborted, and will continue only if
   * the return value is `true`.
   */
  async preExecuteSync(_synchronizer: Synchronizer): Promise<boolean> {
    return true;
  }

  /**
   * Executes before committing the data. If this method returns `false`, then committing will
   * be aborted. It will only commit the data if the return value is `true`.
  */
  async preCommitSync(_synchronizer: Synchronizer): Promise<boolean> {
    return true;
  }

  async commitSync(_itemsToSync: SyncItem[], _ignoredItems: SyncItem[], _conflictItems: SyncItem[]): Promise<boolean> {
    return true;
  };

  async rollbackSync(_itemsToSync: SyncItem[], _ignoredItems: SyncItem[], _conflictItems: SyncItem[]): Promise<void> {
  }

  /**
   * Executed at the end of each sync operation (whether it succeeded or not).
   * It's recommended to implement cleaning logic if necessary.
  */
  async cleanUp(_synchronizer: Synchronizer): Promise<void> {
  }

  set parent(p: Collection | undefined) {
    this._parent = p;
  }

  get parent(): Collection | undefined {
    return this._parent;
  }

  get lastSynchronizer(): Synchronizer | undefined {
    if (this.synchronizers.length == 0) return undefined;
    return this.synchronizers[this.synchronizers.length - 1];
  }

  lastFromParent_ONLY_FOR_TESTING() {
    return this._parent?.latestUpdatedItem();
  }

  async needsSync(syncOperation: SyncOperation): Promise<boolean> {
    if (!this._parent) return false;

    const latestUpdatedItem = await (
      syncOperation == SyncOperation.Post ? this.latestUpdatedItem() : this._parent.latestUpdatedItem()
    );

    // No data to sync.
    if (latestUpdatedItem == null) return false;

    const lastAt = await this.syncMetadata.getLastAt(syncOperation);
    if (!lastAt) return true;
    return lastAt < latestUpdatedItem.updatedAt;
  }

  private async itemsToFetch(lastSyncAt: Date | undefined, limit: number): Promise<SyncItem[]> {
    return (this._parent as Collection).itemsNewerThan(lastSyncAt, limit);
  }

  private async itemsToPost(lastSyncAt: Date | undefined, limit: number): Promise<SyncItem[]> {
    return await this.itemsNewerThan(lastSyncAt, limit);
  }

  /** Gets list of items that can be synced (to either fetch or post). */
  async itemsToSync(syncOperation: SyncOperation, limit: number): Promise<SyncItem[]> {
    if (!this._parent) {
      throw new ParentNotSetError("Cannot sync to parent");
    }

    if (!await this.needsSync(syncOperation)) {
      return [];
    }

    const lastSyncAt = await this.syncMetadata.getLastAt(syncOperation);

    switch (syncOperation) {
      case SyncOperation.Fetch:
        return this.itemsToFetch(lastSyncAt, limit);
      case SyncOperation.Post:
        return this.itemsToPost(lastSyncAt, limit);
    }
  }

  /**
   * Wraps sync operation so that `cleanUp` and `rollback` are conveniently placed at the end
   * and always executed.
  */
  async sync(syncOperation: SyncOperation, limit: number, options: SyncOptions = this.defaultSyncOptions): Promise<Synchronizer> {
    if (limit < 1) {
      throw new Error("Limit must be a positive integer");
    }

    const items: SyncItem[] = await this.itemsToSync(syncOperation, limit);
    const lastSyncAt = await this.syncMetadata.getLastAt(syncOperation);
    const destCollection: Collection = (syncOperation == SyncOperation.Fetch ? this : this._parent) as Collection;
    const synchronizer = new Synchronizer(items, lastSyncAt, destCollection, options);
    this.synchronizers.push(synchronizer);

    try {
      await this.syncAux(synchronizer, syncOperation);
    } catch (e) {
      synchronizer.abort();
    } finally {
      if (SyncPolicy.shouldRollBack(synchronizer)) {
        await synchronizer.rollback();
      }

      await this.cleanUp(synchronizer);
    }

    return synchronizer;
  }

  private async syncAux(synchronizer: Synchronizer, syncOperation: SyncOperation): Promise<void> {
    await synchronizer.prepareSyncData();

    if (!await this.preExecuteSync(synchronizer)) return;

    await synchronizer.executeSync();

    if (SyncPolicy.shouldCommit(synchronizer.syncStatus)) {
      if (await this.preCommitSync(synchronizer)) {
        await synchronizer.commit();
      }
    }

    if (SyncPolicy.shouldUpdateLastSyncAt(synchronizer) && synchronizer.lastUpdatedAt) {
      await this.syncMetadata.setLastAt(synchronizer?.lastUpdatedAt, syncOperation);
    }
  }
}

export default SynchronizableCollection;
