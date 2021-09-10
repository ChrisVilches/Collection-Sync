import SyncItem from "./SyncItem";
import ParentNotSetError from "./exceptions/ParentNotSetError";
import { SyncOptions, SyncConflictStrategy, SyncOperation } from "./types/SyncTypes";
import DocId from "./types/DocId";
import Collection from "./Collection";
import Synchronizer from "./Synchronizer";
import CollectionSyncMetadata from "./CollectionSyncMetadata";
import SyncStatus from "./types/SyncStatus";
import SyncPolicy from "./SyncPolicy";

// TODO: Many methods in this class could be private.

abstract class SynchronizableCollection implements Collection {
  private readonly defaultSyncOptions: SyncOptions = {
    conflictStrategy: SyncConflictStrategy.RaiseError
  };

  // TODO: If it remains private and unused forever then consider removing this.
  private synchronizers: Synchronizer[] = [];

  private _parent?: Collection;

  public syncMetadata: CollectionSyncMetadata;

  constructor(syncMetadata: CollectionSyncMetadata) {
    this.syncMetadata = syncMetadata;
  }

  abstract countAll(): number | Promise<number>;
  abstract findByIds(ids: DocId[]): SyncItem[] | Promise<SyncItem[]>;
  abstract preExecuteSync(synchronizer: Synchronizer): boolean;
  abstract syncBatch(items: SyncItem[]): SyncItem[] | Promise<SyncItem[]>;
  abstract itemsNewerThan(date: Date | undefined, limit: number): SyncItem[] | Promise<SyncItem[]>;
  abstract latestUpdatedItem(): SyncItem | Promise<SyncItem | undefined> | undefined;
  abstract initialize(): Promise<void>;

  // Note that hooks should prevent further execution if they signal or return some value.
  // For example, in RoR it happens when a filter returns false.
  abstract preCommitSync(synchronizer: Synchronizer): boolean;
  /** 
   * Commits the sync operation. Database engines that don't support
   * this should implement a method that returns `true` (because the
   * data was already added without the need for a commit statement). */
  async commitSync(): Promise<boolean> {
    return true;
  };

  /** Rollbacks the current data that's being synchronized. */
  rollbackSync(dummy_data_that_user_can_inspect: number): Promise<void> | void {
  }

  /** Executed at the end of each sync operation (whether it succeeded or not). */
  cleanUp(_synchronizer: Synchronizer): Promise<void> | void {
  }

  set parent(p: Collection | undefined) {
    this._parent = p;
  }

  get parent(): Collection | undefined {
    return this._parent;
  }

  get lastSynchronizer(): Synchronizer | undefined{
    if(this.synchronizers.length == 0) return undefined;
    return this.synchronizers[this.synchronizers.length - 1];
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

  async sync(syncOperation: SyncOperation, limit: number, options: SyncOptions = this.defaultSyncOptions) {
    if (limit < 1) {
      throw new Error("Limit must be a positive integer");
    }

    const destCollection: Collection = (syncOperation == SyncOperation.Fetch ? this : this._parent) as Collection;
    const synchronizer = new Synchronizer(destCollection);
    this.synchronizers.push(synchronizer);
    const items: SyncItem[] = await this.itemsToSync(syncOperation, limit);

    if(items.length == 0){
      return;
    }

    const lastSyncAt = await this.syncMetadata.getLastAt(syncOperation);

    if(!await this.preExecuteSync(synchronizer)){
      return synchronizer.abort();
    }

    try {
      await synchronizer.executeSync(
        lastSyncAt,
        items,
        options
      );

      if(SyncPolicy.shouldCommit(synchronizer.syncStatus)){
        // Only commit if pre commit returns true.
        if(await this.preCommitSync(synchronizer)){
          await synchronizer.commit();
        }
      }
    } finally {
      if (SyncPolicy.shouldRollBack(synchronizer)) {
        await synchronizer.rollback();
      }

      if (SyncPolicy.shouldUpdateLastSyncAt(synchronizer) && synchronizer.lastUpdatedAt) {
        await this.syncMetadata.setLastAt(synchronizer?.lastUpdatedAt, syncOperation);
      }

      await this.cleanUp(synchronizer);
    }

    return synchronizer;
  }
}

export default SynchronizableCollection;
