import SyncItem from "./SyncItem";
import DocId from "./types/DocId";
import IInitializable from "./IInitializable";
import Synchronizer from "./Synchronizer";

// TODO: One thing to keep in mind is that if there are multiple users synchronizing, then commit and rollback
//       must affect the data of only that sync process. This should be implemented by the user (in the slave and master
//       collection, implementation is ad-hoc). But it'd be great to comment it.
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
  itemsNewerThan(date: Date | undefined, limit: number): Promise<SyncItem[]> | SyncItem[];

  /**
   * Gets the highest `updateAt` date in the collection.
  */
  latestUpdatedItem(): Promise<SyncItem | undefined> | SyncItem | undefined;

  // TODO: dummy_data_that_user_can_inspect: number <---- This should be not Synchronizer
  //       or SynchronizableCollection related data, but plain old item[] like
  //       inserted[], deleted[], ignored[], etc. Don't clutter this class with sync stuff.
  //       In fact, the "syncBatch" method is like a simple DB CRUD method.

  /** 
   * Commits the sync operation. Database engines that don't support
   * this should implement a method that returns `true` (because the
   * data was already added without the need for a commit statement).
  */
  commitSync(dummy_data_that_user_can_inspect: number): Promise<boolean>;

  /** Rollbacks the current data that's being synchronized. */
  rollbackSync(dummy_data_that_user_can_inspect: number): Promise<void> | void;
}

export default Collection;
