import { SyncOperation } from "./types/SyncTypes";
import IInitializable from "./IInitializable";

abstract class CollectionSyncMetadata implements IInitializable{
  abstract setLastFetchAt(d : Date): void;
  abstract setLastPostAt(d : Date): void;

  abstract getLastFetchAt(): Promise<Date | undefined> | Date | undefined;
  abstract getLastPostAt(): Promise<Date | undefined> | Date | undefined;

  abstract initialize(): Promise<void>;

  async setLastAt(d : Date, syncOperation: SyncOperation){
    if(syncOperation == SyncOperation.Fetch){
      return await this.setLastFetchAt(d);
    } else {
      return await this.setLastPostAt(d);
    }
  }

  async getLastAt(syncOperation: SyncOperation): Promise<Date | undefined>{
    if(syncOperation == SyncOperation.Fetch){
      return await this.getLastFetchAt();
    } else {
      return await this.getLastPostAt();
    }
  }
}

export default CollectionSyncMetadata;
