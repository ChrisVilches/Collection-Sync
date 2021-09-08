import CollectionItem from "./CollectionItem";
import DocId from "./types/DocId";
import IInitializable from "./IInitializable";
import * as R from "ramda";

abstract class Collection implements IInitializable{
  abstract countAll(): Promise<number> | number;

  abstract initialize(): Promise<void>;

  // TODO: Can be optimized so that it only returns a version that only has ID and updatedAt (omitting the document).
  abstract findByIds(ids: DocId[]): Promise<CollectionItem[]> | CollectionItem[];

  abstract upsertBatch(items: CollectionItem[]): Promise<CollectionItem[]> | CollectionItem[];

  abstract itemsNewerThan(date: Date | undefined): Promise<CollectionItem[]> | CollectionItem[];

  /**
  * Gets the highest `updateAt` date in the collection.
  */
  abstract latestUpdatedItem(): Promise<CollectionItem | undefined> | CollectionItem | undefined;
}

export default Collection;
