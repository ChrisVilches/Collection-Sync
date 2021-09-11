import DocId from "./types/DocId";
import SyncItemAction from "./types/SyncItemAction";

/** Contains an ID that identifies the synchronizable object, the document data itself, and `updatedAt` (which is used to determine whether the document must be synchronized or not). */
abstract class SyncItem {
  private _id: DocId;
  private _updatedAt: Date;
  private _document: any;
  private _action: SyncItemAction;

  get id(): DocId {
    return this._id;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get document(): any {
    return this._document;
  }

  /** Determines whether the item should be updated or not. */
  get isUpdate(): boolean {
    return this._action == SyncItemAction.Update;
  }

  /** Determines whether the item should be removed from the database or not. */
  get isDelete(): boolean {
    return this._action == SyncItemAction.Delete;
  }

  constructor(id: DocId, document: any, updatedAt: Date, action = SyncItemAction.Update) {
    if (!updatedAt) {
      throw new Error("Updated At must be defined");
    }
    this._id = id;
    this._document = document;
    this._updatedAt = updatedAt;
    this._action = action;
  }

  update(document: any, updatedAt: Date) {
    this._document = document;
    this._updatedAt = updatedAt;
  }

  equals(other: SyncItem | undefined): boolean{
    if(!other) return false;
    return this.updatedAt.getTime() == other.updatedAt.getTime();
  }
}

export default SyncItem;
