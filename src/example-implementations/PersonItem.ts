import CollectionItem from "../CollectionItem";
import DocId from "../types/DocId";

interface Person{
  name: string;
  age: number;
}

class PersonItem extends CollectionItem {
  constructor(id: DocId, person: Person, updatedAt: Date){
    super(id, person, updatedAt);
  }
}

export default PersonItem;
