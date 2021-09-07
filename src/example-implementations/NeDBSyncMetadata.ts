import CollectionSyncMetadata from "../CollectionSyncMetadata";

class NeDBSyncMetadata extends CollectionSyncMetadata{
  async initialize(){

  }

  async setLastFetchAt(d : Date){
    // Insert NeDB code here...
    throw new Error("Not implemented");
  }
  async setLastPostAt(d : Date){
    // Insert NeDB code here...
    throw new Error("Not implemented");
  }

  async getLastFetchAt(): Promise<Date>{
    // Insert NeDB code here...
    throw new Error("Not implemented");
  }
  async getLastPostAt(): Promise<Date>{
    // Insert NeDB code here...
    throw new Error("Not implemented");
  }
}

export default NeDBSyncMetadata;
