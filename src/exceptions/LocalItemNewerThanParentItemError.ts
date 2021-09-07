import DocId from "../types/DocId";

class LocalItemNewerThanParentItemError extends Error {
  id: DocId;

  constructor(id: DocId) {
    super(`Local data is newer than parent's data, document ID ${id}`);
    this.id = id;

    Object.setPrototypeOf(this, LocalItemNewerThanParentItemError.prototype);
  }
}

export default LocalItemNewerThanParentItemError;
