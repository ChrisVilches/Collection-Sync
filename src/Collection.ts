import SyncItem from "./SyncItem";
import DocId from "./types/DocId";
import IInitializable from "./IInitializable";

/**
 * This interface defines several CRUD methods to operate on a collection.
 * These methods can be implemented by accessing a local database, requesting a restful API (remote DB), etc.
*/
interface Collection extends IInitializable {
  /** Gets the number of items in the collection. */
  countAll(): Promise<number> | number;

  /** Returns a list of records using an ID list as search query. */
  findByIds(ids: DocId[]): Promise<SyncItem[]> | SyncItem[];

  /**
   * Syncs (upsert/delete) a batch (list) of items into this collection.
   * Order of document processing doesn't need to be in any particular order.
   */
  syncBatch(items: SyncItem[]): Promise<SyncItem[]> | SyncItem[];

  /** Returns a list of items that have `updatedAt` greater than argument provided.
   * The list MUST be ordered by `updatedAt ASC`, otherwise an exception will be thrown (no syncing
   * will be executed).
  */
  itemsNewerThan(date: Date | undefined, limit: number, onlyDirtyItems: boolean): Promise<SyncItem[]> | SyncItem[];

  /**
   * Gets the highest `updateAt` date in the collection.
  */
  latestUpdatedItem(onlyDirtyItems: boolean): Promise<SyncItem | undefined> | SyncItem | undefined;

  // TODO: For commit and rollback, maybe adding "items that were actually synced" (successfully)
  //       would be great too. This is kind of difficult to implement because that would require to
  //       rely on the user implementation of 'syncBatch', which may be inaccurate, but it's the only way.

  /** 
   * Commits the sync operation. Database engines that don't support
   * this should implement a method that returns `true` (because the
   * data was already added without the need for a commit statement).
   * Make sure to commit the data from one specific sync process in order to avoid committing data
   * pushed by multiple users synchronizing at the same time.
  */
  commitSync(itemsToSync: SyncItem[], ignoredItems: SyncItem[], conflictItems: SyncItem[]): Promise<boolean>;

  /**
   * Rollbacks the current data that's being synchronized.
   * Make sure to rollback the data from one specific sync process in order to avoid discarding data
   * pushed by multiple users synchronizing at the same time.
  */
  rollbackSync(itemsToSync: SyncItem[], ignoredItems: SyncItem[], conflictItems: SyncItem[]): Promise<void> | void;
}

export default Collection;
