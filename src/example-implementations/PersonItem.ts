import SyncItem from "../SyncItem";
import DocId from "../types/DocId";

/** Person document schema. */
interface Person{
  name: string;
  age: number;
}

class PersonItem extends SyncItem {
  constructor(id: DocId, person: Person, updatedAt: Date){
    super(id, person, updatedAt);
  }
}

export default PersonItem;
