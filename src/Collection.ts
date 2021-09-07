import CollectionItem from "./CollectionItem";
import DocId from "./types/DocId";
import IInitializable from "./IInitializable";

abstract class Collection implements IInitializable{
  abstract countAll(): Promise<number> | number;

  /** Implement any async logic to load database, create connection, etc. */
  abstract initialize(): Promise<void>;

  // TODO: This should be optimized to be batch-first (and also the syncing algorithms).
  abstract findById(id: DocId): Promise<CollectionItem> | CollectionItem | undefined;

  abstract upsert(item: CollectionItem): Promise<CollectionItem> | CollectionItem;

  abstract itemsNewerThan(date: Date | undefined): Promise<CollectionItem[]> | CollectionItem[];

  /**
  * Gets the highest `updateAt` date in the collection.
  */
  abstract latestUpdatedItem(): Promise<CollectionItem | undefined> | CollectionItem | undefined;
}

export default Collection;
