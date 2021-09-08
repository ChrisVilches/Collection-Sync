import CollectionSyncMetadata from "../CollectionSyncMetadata";
import fs from "fs";
import path from "path";

interface DatesTuple{
  lastFetchAt: Date | undefined;
  lastPostAt: Date | undefined;
}

/** A JSON file sync metadata manager. It writes and reads the file for every request (unoptimized for the sake of testing). */
class JsonFileSynMetadata extends CollectionSyncMetadata{
  private _fileName: string

  private readonly _initialLastFetchAt: Date | undefined;
  private readonly _initialLastPostAt: Date | undefined;

  constructor(fileFolderPath: string, lastFetchAt?: Date, lastPostAt?: Date){
    super();
    this._initialLastFetchAt = lastFetchAt;
    this._initialLastPostAt = lastPostAt;

    const timeStamp = (new Date()).getTime();
    const randomId = Math.ceil(Math.random() * 100000000);
    this._fileName = path.join(fileFolderPath, `${randomId}_data_sync_${timeStamp}.json`);
  }

  async initialize(): Promise<void>{
    this.setDatesToJsonFile({
      lastFetchAt: this._initialLastFetchAt,
      lastPostAt: this._initialLastPostAt
    });
  }

  private setDatesToJsonFile(dates: DatesTuple): Promise<void>{
    return new Promise((resolve, reject) => {
      fs.writeFile(this._fileName, JSON.stringify(dates), 'utf8', function(err) {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  private getDatesFromJsonFile(): Promise<DatesTuple>{
    return new Promise((resolve, reject) => {
      fs.readFile(this._fileName, 'utf8', (err, data) => {
        if(err) return reject(err);

        let obj: DatesTuple;
        try{
          obj = JSON.parse(data);
        } catch(_e){
          obj = {
            lastFetchAt: undefined,
            lastPostAt: undefined
          }
        }
        resolve({
          lastFetchAt: !obj.lastFetchAt ? undefined : new Date(obj.lastFetchAt),
          lastPostAt: !obj.lastPostAt ? undefined : new Date(obj.lastPostAt),
        });
      });
    });
  }

  async setLastFetchAt(d : Date): Promise<void>{
    const datesObj: DatesTuple = await this.getDatesFromJsonFile();
    datesObj.lastFetchAt = d;
    await this.setDatesToJsonFile(datesObj);
  }

  async setLastPostAt(d : Date): Promise<void>{
    const datesObj: DatesTuple = await this.getDatesFromJsonFile();
    datesObj.lastPostAt = d;
    await this.setDatesToJsonFile(datesObj);
  }

  async getLastFetchAt(): Promise<Date | undefined>{
    const datesObj: DatesTuple = await this.getDatesFromJsonFile();
    return datesObj.lastFetchAt;
  }

  async getLastPostAt(): Promise<Date | undefined>{
    const datesObj: DatesTuple = await this.getDatesFromJsonFile();
    return datesObj.lastPostAt;
  }
}

export default JsonFileSynMetadata;
