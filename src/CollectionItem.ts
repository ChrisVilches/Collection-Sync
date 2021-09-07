import { Map } from 'immutable';

abstract class CollectionItem {
  private _id: string | number;
  private _updatedAt: Date;
  private _document: object; // TODO: Should be parameterized somehow.
  private _deleted: boolean;

  get id(): string | number{
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

  constructor(id: string | number, d: object, updatedAt: Date){
    this._id = id;
    this._document = d;
    this._updatedAt = updatedAt;
    this._deleted = false;
  }

  update(d: object, updatedAt: Date, deleted: boolean){
    this._document = d;
    this._updatedAt = updatedAt;
    this._deleted = deleted;
  }

  toObject(): Map<any, any>{
    return Map({
      id: this._id,
      document: this._document,
      deleted: this._deleted,
      updatedAt: this._updatedAt
    });
  }
}

export default CollectionItem;
