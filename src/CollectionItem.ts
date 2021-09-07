import DocId from "./types/DocId";

abstract class CollectionItem {
  private _id: DocId;
  private _updatedAt: Date;
  private _document: object; // TODO: Should be parameterized somehow (i.e. use a T type instead of object).
  private _deleted: boolean;

  get id(): DocId{
    return this._id;
  }

  get updatedAt(): Date{
    return this._updatedAt;
  }

  get document(): object{
    return this._document;
  }

  get deleted(): boolean{
    return this._deleted;
  }

  constructor(id: DocId, d: object, updatedAt: Date, deleted: boolean = false){
    this._id = id;
    this._document = d;
    this._updatedAt = updatedAt;
    this._deleted = deleted;
  }

  update(d: object, updatedAt: Date, deleted: boolean){
    this._document = d;
    this._updatedAt = updatedAt;
    this._deleted = deleted;
  }
}

export default CollectionItem;
