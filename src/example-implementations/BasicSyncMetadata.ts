import CollectionSyncMetadata from "../CollectionSyncMetadata";

/** A simple sync metadata manager. */
class BasicSyncMetadata extends CollectionSyncMetadata{
  private _lastFetchAt?: Date;
  private _lastPostAt?: Date;

  constructor(lastFetchAt?: Date, lastPostAt?: Date){
    super();
    this._lastFetchAt = lastFetchAt;
    this._lastPostAt = lastPostAt;
  }

  setLastFetchAt(d : Date): void{
    this._lastFetchAt = d;
  }

  setLastPostAt(d : Date): void{
    this._lastPostAt = d;
  }

  getLastFetchAt(): Date | undefined{
    return this._lastFetchAt;
  }

  getLastPostAt(): Date | undefined{
    return this._lastPostAt;
  }
}

export default BasicSyncMetadata;
