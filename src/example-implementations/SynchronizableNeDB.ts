import CollectionItem from "../CollectionItem";
import PersonItem from "./PersonItem";
import SynchronizableCollection from "../SynchronizableCollection";
import NeDBSyncMetadata from "./NeDBSyncMetadata";
import DocId from "../types/DocId";
import NeDB from "nedb";

class SynchronizableNeDB extends SynchronizableCollection{
  private db?: NeDB;

  constructor(syncMetadata = new NeDBSyncMetadata()){
    super(syncMetadata);
  }

  async initialize(){
    this.db = new NeDB({ timestampData: true });
  }

  makeItem(doc: any): PersonItem | undefined{
    if(doc == undefined) return undefined;
    return new PersonItem(doc.id, doc, doc.updatedAt);
  }

  countAll(): Promise<number>{
    return new Promise((resolve, reject) => {
      this.db?.count({}, function(err, count) {
        if (err) return reject(err);
        resolve(count);
      });
    });
  }

  itemsNewerThan(date: Date | undefined): Promise<CollectionItem[]>{
    let where: object;
    if(date == undefined){
      where = {};
    }

    // TODO: Does it work OK like this?
    where = { updatedAt: { $gt: date } };

    return new Promise((resolve, reject) => {
      this.db?.find(where).sort({ updatedAt: 1 }).exec(function(err, docs) {
        if(err) return reject(err);
        resolve(docs);
      });
    });
  }

  findById(id: DocId): Promise<CollectionItem>{
    return new Promise((resolve, reject) => {
      this.db?.findOne({ _id: id }, (err, doc) => {
        if(err) return reject(err);
        doc = this.makeItem(doc);
        resolve(doc);
      });
    });
  }

  upsert(item: CollectionItem): Promise<CollectionItem>{
    return new Promise(resolve => {
      this.db?.update({ _id: item.id }, item.document, { upsert: true }, function (err, numReplaced, upsert) {
        resolve(item);
      });
    });
  }

  latestUpdatedItem(): Promise<CollectionItem | undefined>{
    return new Promise((resolve, reject) => {
      this.db?.find({}).sort({ updatedAt: -1 }).limit(1).exec((err, docs) => {
        if(err) return reject(err);
        resolve(this.makeItem(docs[0]));
      });
    });
  }
}

export default SynchronizableNeDB;
