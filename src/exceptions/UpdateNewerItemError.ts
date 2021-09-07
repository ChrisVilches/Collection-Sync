import DocId from "../types/DocId";

class UpdateNewerItemError extends Error {
  id: DocId;

  constructor(id: DocId) {
    super(`Cannot update a newer item using an older item, document ID ${id}`);
    this.id = id;

    Object.setPrototypeOf(this, UpdateNewerItemError.prototype);
  }
}

export default UpdateNewerItemError;
