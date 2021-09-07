import CollectionItem from "./CollectionItem";

interface Person{
  name: string;
  age: number;
}

class PersonItem extends CollectionItem {
  constructor(id: string | number, person: Person, updatedAt: Date){
    super(id, person, updatedAt);
  }

  get deleted() : boolean{
    return false;
  }
}

export default PersonItem;
