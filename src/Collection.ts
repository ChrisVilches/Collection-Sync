import SyncItem from "./SyncItem";
import DocId from "./types/DocId";
import IInitializable from "./IInitializable";

// TODO: One thing to keep in mind is that if there are multiple users synchronizing, then commit and rollback
//       must affect the data of only that sync process. This should be implemented by the user (in the slave and master
//       collection, implementation is ad-hoc). But it'd be great to comment it.
interface Collection extends IInitializable{
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
}

export default Collection;
