interface IInitializable {
  /** Executes async logic to initialize collection or datastore (open file, create database connection, etc). */
  initialize(): Promise<void>;
}

export default IInitializable;
