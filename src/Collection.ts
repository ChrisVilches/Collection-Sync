import CollectionItem from "./CollectionItem";
import DocId from "./types/DocId";
import IInitializable from "./IInitializable";

// TODO: Maybe it'd be better to change it to interface.
//       This way, users can use "implements" in their models.
abstract class Collection implements IInitializable{
  /** Gets the number of items in the collection. */
  abstract countAll(): Promise<number> | number;

  abstract initialize(): Promise<void>;

  /** Returns a list of records using an ID list as search query. */
  abstract findByIds(ids: DocId[]): Promise<CollectionItem[]> | CollectionItem[];

  /**
   * Upserts a batch (list) of items into this collection.
   */
  abstract upsertBatch(items: CollectionItem[]): Promise<CollectionItem[]> | CollectionItem[];

  /** Returns a list of items that have `updatedAt` greater than argument provided.
   * The list MUST be ordered by `updatedAt ASC`, otherwise an exception will be thrown (no syncing
   * will be executed).
  */
  abstract itemsNewerThan(date: Date | undefined, limit: number): Promise<CollectionItem[]> | CollectionItem[];

  /**
  * Gets the highest `updateAt` date in the collection.
  */
  abstract latestUpdatedItem(): Promise<CollectionItem | undefined> | CollectionItem | undefined;
}

export default Collection;
