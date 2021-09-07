import { SyncOperation } from "./types/SyncTypes";

abstract class CollectionSyncMetadata{
  abstract setLastFetchAt(d : Date): void;
  abstract setLastPostAt(d : Date): void;

  abstract getLastFetchAt(): Promise<Date> | Date | undefined;
  abstract getLastPostAt(): Promise<Date> | Date | undefined;

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
