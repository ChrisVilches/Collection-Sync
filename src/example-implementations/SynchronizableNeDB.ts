import SyncItem from "../SyncItem";
import PersonItem from "./PersonItem";
import SynchronizableCollection from "../SynchronizableCollection";
import BasicSyncMetadata from "./BasicSyncMetadata";
import CollectionSyncMetadata from "../CollectionSyncMetadata";
import DocId from "../types/DocId";
import NeDB from "nedb";

/** Since some databases auto-generate an ID value (such as NeDB), a custom ID attribute name is defined to store a custom ID value in the document. */
const ID_ATTRIBUTE_NAME: string = "documentId";

class SynchronizableNeDB extends SynchronizableCollection {
  protected db?: NeDB;

  constructor(syncMetadata: CollectionSyncMetadata = new BasicSyncMetadata()) {
    super(syncMetadata);
  }

  async initialize() {
    this.db = new NeDB({ timestampData: false }); // Add timestamp data manually.
  }

  /** Creates a SyncItem object starting from a document. It extracts its `ID`, `updatedAt`, and document data to create the object. */
  makeItem(doc: any): PersonItem | undefined {
    if (!doc) return undefined;
    return new PersonItem(doc[ID_ATTRIBUTE_NAME], doc, doc.updatedAt);
  }

  countAll(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db?.count({}, (err, count) => {
        if (err) return reject(err);
        resolve(count);
      });
    });
  }

  itemsNewerThan(date: Date | undefined, limit: number): Promise<SyncItem[]> {
    let where = !date ? {} : { updatedAt: { $gt: date } };

    return new Promise((resolve, reject) => {
      this.db?.find(where).sort({ updatedAt: 1 }).limit(limit).exec((err, docs) => {
        if (err) return reject(err);
        docs = docs.map(this.makeItem);
        resolve(docs);
      });
    });
  }

  findByIds(ids: DocId[]): Promise<SyncItem[]> {
    return new Promise((resolve, reject) => {
      this.db?.find({ [ID_ATTRIBUTE_NAME]: { $in: ids } }, (err: any, docs: any) => {
        if (err) return reject(err);
        resolve(docs.map(this.makeItem));
      });
    });
  }

  private executeSyncItem(item: SyncItem): Promise<SyncItem> {
    return new Promise((resolve, reject) => {
      if (item.isDelete) {
        // Behavior is untested.
        // In theory it should work right away, but it might be necessary to tweak syncBatch a bit
        // so that it returns upserted items as well as deleted items (e.g. a map with both keys
        // instead of just one return value).
        // Deletion not supported by this implementation.
      } else {
        // These two modifications are to comply with the sync logic.
        // (1) ID is not generated automatically (must be kept across databases), therefore use custom one (some DBs auto-generate it).
        //     It must be the same to make syncing possible.
        // (2) Store custom updatedAt (if the DB engine allows modifying it, then that can be used as well,
        //     but NeDB generates updatedAt and sets the value automatically, so this example was made
        //     with a custom updatedAt added to the document).
        item.document[ID_ATTRIBUTE_NAME] = item.id;
        item.document.updatedAt = item.updatedAt;
        delete item.document._id; // Avoid "You cannot change a document's _id" error (NeDB specific).

        this.db?.update({ [ID_ATTRIBUTE_NAME]: item.id }, item.document, { upsert: true }, (err, _numReplaced, _upsert) => {
          if (err) return reject(err);
          resolve(item);
        });
      }
    });
  }

  async syncBatch(items: SyncItem[]): Promise<SyncItem[]> {
    const result = [];
    for (let i = 0; i < items.length; i++) {
      const synced = await this.executeSyncItem(items[i]);
      result.push(synced);
    }
    return result;
  }

  latestUpdatedItem(): Promise<SyncItem | undefined> {
    return new Promise((resolve, reject) => {
      this.db?.find({}).sort({ updatedAt: -1 }).limit(1).exec((err, docs) => {
        if (err) return reject(err);
        resolve(this.makeItem(docs[0]));
      });
    });
  }
}

export default SynchronizableNeDB;
