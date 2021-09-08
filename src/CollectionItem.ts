import DocId from "./types/DocId";

abstract class CollectionItem {
  private _id: DocId;
  private _updatedAt: Date;
  private _document: any;

  get id(): DocId{
    return this._id;
  }

  get updatedAt(): Date{
    return this._updatedAt;
  }

  get document(): any{
    return this._document;
  }

  constructor(id: DocId, document: any, updatedAt: Date){
    this._id = id;
    this._document = document;
    this._updatedAt = updatedAt;
  }

  update(document: any, updatedAt: Date){
    this._document = document;
    this._updatedAt = updatedAt;
  }
}

export default CollectionItem;
