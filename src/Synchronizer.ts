import SyncItem from "./SyncItem";
import Collection from "./Collection";
import { SyncConflictStrategy, SyncOperation, SyncOptions } from "./types/SyncTypes";
import DocId from "./types/DocId";
import * as R from "ramda";
import SyncStatus from "./types/SyncStatus";
import ConflictPolicy from "./ConflictPolicy";

class Synchronizer {
  /** Used to keep state of sync process. */
  private lastSyncedItem?: SyncItem;

  // Currently not used, so this can wait for a future version.
  private _startDate: Date;
  private _endDate?: Date;

  private _syncedItems: SyncItem[] = [];

  /** List of filtered items (removing conflicts, etc) that actually get sent to the destination collection for syncing. */
  private _itemsToSync: SyncItem[] = [];
  private _ignoredItems: SyncItem[] = []
  private _conflictItems: SyncItem[] = [];

  private _syncStatus: SyncStatus = SyncStatus.NotStarted;

  private destCollection: Collection;
  private committed: boolean = false;
  private _rollbacked: boolean = false;
  private _options: SyncOptions;

  private _unfilteredItems: SyncItem[];
  private _lastSyncAt?: Date;

  private _alreadyExecuted: boolean = false;

  get successfullyRollbacked(): boolean {
    return this._rollbacked;
  }

  get successfullyCommitted(): boolean {
    return this.committed;
  }

  get syncStatus(): SyncStatus {
    return this._syncStatus;
  }

  get lastUpdatedAt(): Date | undefined {
    return this.lastSyncedItem?.updatedAt;
  }

  get itemsToSync(): SyncItem[] {
    return this._itemsToSync;
  }

  get conflictItems(): SyncItem[] {
    return this._conflictItems;
  }

  get ignoredItems(): SyncItem[] {
    return this._ignoredItems;
  }

  get syncedItems(): SyncItem[] {
    return this._syncedItems;
  }

  constructor(items: SyncItem[], lastSyncAt: Date | undefined, destCollection: Collection, options: SyncOptions, startDate?: Date) {
    this.destCollection = destCollection;
    this._options = options;
    this._unfilteredItems = items;
    this._lastSyncAt = lastSyncAt;

    if (startDate) {
      this._startDate = startDate;
    } else {
      this._startDate = new Date();
    }
  }

  async prepareSyncData(): Promise<void> {
    let compareObjects: { [key in DocId]: SyncItem } = {};

    compareObjects = R.indexBy(R.prop('id'), await this.destCollection.findByIds(this._unfilteredItems.map(i => i.id)));

    /**
     * This is to stop adding items to sync after a conflict (with raise error flag) has been found.
     * If conflicts are ignored, this doesn't do anything.
    */
    let stopAdding = false;

    const ignoredCompareObjects: SyncItem[] = [];

    for (let i = 0; i < this._unfilteredItems.length; i++) {
      const item = this._unfilteredItems[i];
      const objectToCompare: SyncItem | undefined = compareObjects[item.id];

      const conflict = ConflictPolicy.isConflict(this._lastSyncAt, item, objectToCompare);

      // TODO: Try to refactor the way ignored items (which should change their name, it should be more like
      //       "there are conflicts, but KEEP this data and update their date to make them the newest"),
      //       and put them in different arrays for syncing. This refactor is mostly to make a user-friendly API.

      // TODO: This should be part of the inputs of "shouldSyncItem", and perhaps other methods too.
      //       (Instead of adding it to the if statement).
      const sameVersion = item.equals(objectToCompare);

      if (sameVersion || ConflictPolicy.shouldIgnoreItem(conflict, this._options.conflictStrategy)) {
        this._ignoredItems.push(item);
        ignoredCompareObjects.push(objectToCompare);
      }

      if (!sameVersion && ConflictPolicy.shouldSyncItem(conflict, this._options.conflictStrategy, stopAdding)) {
        this._itemsToSync.push(item);
      }

      if (!sameVersion && ConflictPolicy.shouldHandleAsConflict(conflict, this._options.conflictStrategy)) {
        this._conflictItems.push(item);
      }

      if (ConflictPolicy.shouldStopAdding(conflict, this._options.conflictStrategy)) {
        stopAdding = true;
      }
    }

    // Add ignored items to be synced, but with a new date. Because what this says is:
    // I know there is a more recent version, but I choose to keep MY version, but in order
    // to do that, I will pretend I fetch it, but then modify it again now (that's why it has
    // the current date).
    for (let i = 0; i < ignoredCompareObjects.length; i++) {
      // This is only necessary to do for the ignore strategy. Other than that, the "ignoredCompareObjects"
      // list is also populated when two items are the same (therefore not ignored as in "there was a conflict,
      // but the strategy is to ignore", but as in "they are the same, so ignore (and don't re-push/fetch)").
      // TODO: Refactor this. In fact, refactor this entire method.

      if (this._options.conflictStrategy != SyncConflictStrategy.Ignore) continue;
      const obj = ignoredCompareObjects[i];

      // NOTE: It seems that it's very important to set a real date of fetch/post, not just copy the last
      //       date from the fetched/posted item. There are few situations where copying the date would
      //       result in other slaves not picking up changes.
      obj.update(obj.document, this._startDate);

      this._itemsToSync.push(ignoredCompareObjects[i]);
    }

    // Sadly it's necessary to sort again here.
    this._itemsToSync = this._itemsToSync.sort((a: SyncItem, b: SyncItem) => (a.updatedAt as any) - (b.updatedAt as any));

    //console.log("items to sync", this._itemsToSync)
    if (ConflictPolicy.shouldSetStatusAsConflict(this._conflictItems.length > 0, this._options.conflictStrategy)) {
      this._syncStatus = SyncStatus.Conflict;
    }
  }

  /**
   * This method sends the data to the destination collection.
   * It throws no exception related to WRITE/DELETE database operations.
   * READ operations used inside this method might fail, as well as errors due to wrong
   * arguments, but when a WRITE/DELETE fails, it sets the status accordingly for further inspection,
   * and does not throw any error.
   * This method can only be executed once. In order to sync again, create a new instance.
  */
  async executeSync() {
    if (this._alreadyExecuted) {
      throw new Error("Cannot execute sync again");
    }

    this._alreadyExecuted = true;

    if (!this.areItemsSorted(this._itemsToSync)) {
      throw new Error("Items to sync are not ordered correctly (order must be updatedAt ASC)");
    }

    await this.syncItems();
  }

  private cleanUp() {
    // Free memory after using it.

    // TODO: Do this micro optimization.
    // this.destCollection = undefined;
  }

  /** Executes a commit. If it does not succeed, status is set to `SyncStatus.UnexpectedError`. */
  async commit() {
    await this.retryUntilSuccess(
      5,
      async () => await this.destCollection.commitSync(this._itemsToSync, this._ignoredItems, this._conflictItems),
      (result: any) => this.committed = result
    );

    // No longer needed to hold some data since it finished.
    this.cleanUp();
  }

  /** Executes a rollback. If it does not succeed, status is set to `SyncStatus.UnexpectedError`. */
  async rollback() {
    await this.retryUntilSuccess(
      5,
      async () => await this.destCollection.rollbackSync(this._itemsToSync, this._ignoredItems, this._conflictItems),
      () => this._rollbacked = true
    );

    // No longer needed to hold some data since it finished.
    this.cleanUp();
  }

  /**
   * Retries a function N times until it succeeds. If it doesn't succeed, it sets
   * the status to error.
   */
  private async retryUntilSuccess(times: number = 1, cb: Function, onSuccess: Function) {
    let err;
    let result;
    for (let i = 0; i < times; i++) {
      try {
        err = undefined;
        result = await cb();
        break;
      } catch (e) {
        err = e;
      }
    }

    await onSuccess(result);

    if (err) {
      this._syncStatus = SyncStatus.UnexpectedError;
    }
  }

  private async syncItems(): Promise<void> {
    if (this._syncStatus == SyncStatus.Conflict) return;

    // NOTE: This status can never be observed, because it will change right away.
    this._syncStatus = SyncStatus.Running;

    if (this._itemsToSync.length == 0)
      this._syncStatus = SyncStatus.PreCommitDataTransmittedSuccessfully;
    else if (this._itemsToSync.length > 0) {
      try {
        this._syncedItems = await this.destCollection.syncBatch(this._itemsToSync);
        this._syncStatus = SyncStatus.PreCommitDataTransmittedSuccessfully;
      } catch (e) {
        this._syncStatus = SyncStatus.UnexpectedError;
        return;
      }
    }

    // Get the highest updateAt, from the synced items + the ignored items (ignored items
    // are also synced, because they need to update its date).
    this.lastSyncedItem = this.itemHighestUpdatedAt(this._syncedItems);
  }

  abort() {
    this._syncStatus = SyncStatus.Aborted;
  }

  private itemHighestUpdatedAt(items: SyncItem[]): SyncItem | undefined {
    if (items.length == 0) return undefined;

    let highest = items[0];

    for (let i = 1; i < items.length; i++) {
      const curr = items[i];
      if (highest.updatedAt < curr.updatedAt) {
        highest = curr;
      }
    }

    return highest;
  }

  private areItemsSorted(items: SyncItem[]): boolean {
    if (items.length < 2) return true;

    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const curr = items[i];

      if (prev.updatedAt > curr.updatedAt) {
        console.log("NOT ORDERED")
        console.log(items)
        return false;
      }
    }

    return true;
  }
}

export default Synchronizer;
