import DocId from "./types/DocId";
import SyncItemAction from "./types/SyncItemAction";

/** Contains an ID that identifies the synchronizable object, the document data itself, and `updatedAt` (which is used to determine whether the document must be synchronized or not). */
abstract class SyncItem {
  private _id: DocId;
  private _updatedAt: Date;
  private _document: any;
  private _action: SyncItemAction;
  private _dirty: boolean;

  get id(): DocId {
    return this._id;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get document(): any {
    return this._document;
  }

  get dirty(): boolean {
    return this._dirty;
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
    this._dirty = false;
  }

  update(document: any, updatedAt: Date) {
    this._document = document;
    this._updatedAt = updatedAt;
  }

  taint(): void {
    this._dirty = true;
  }

  untaint(): void {
    this._dirty = false;
  }
}

export default SyncItem;
