# Collection Sync

Javascript Library for bi-directional database synchronization between multiple devices or servers. Customizable and completely database agnostic.

See [Documentation](/docs/modules.md).

## Use cases

Some examples where this mechanism would be useful:

* Memo app that works offline, and updates remote database when it goes online.
* Multiplatform app (desktop, mobile, web app) which works offline (in mobile and desktop), and updates remote database when going online. When using the app in a different device, the new data is downloaded, making all devices up to date.

## Install

```bash
npm install collection-sync
```

## How to use

Make sure your project is using TypeScript.

Import dependencies:

```ts
import { SyncItem } from "collection-sync";
import { SynchronizableCollection } from "collection-sync";
import { CollectionSyncMetadata } from "collection-sync";
import { SyncOperation, SyncConflictStrategy } from "collection-sync";
import DocId from "collection-sync/dist/types/DocId";
```

Create a class that extends [SyncItem](/docs/classes/SyncItem.md), and populates its data starting from a document from your database. You must customize the way to extract the ID and date it was last updated.

If we use Mongo's `_id`, when synchronizing from one database to another it might be impossible to set it, since some database engines auto generate the `_id` value, hence you must choose how to identify documents using a custom way.

The same applies for `updatedAt`. If your database engine automatically sets `updatedAt` when saving a record, then you'll need to have a custom attribute you can set freely.

Synchronization will fail if you try to set the ID and/or `updatedAt` but your database refuses to leave you set a specific value.

```ts
class CustomItem extends SyncItem {
  constructor(doc: any /* e.g. Mongo Document */){
    super(doc.documentId, doc, doc.updatedAt);
  }
}
```

Then, create a class that extends [SynchronizableCollection](/docs/classes/SynchronizableCollection.md) and implement its abstract methods:

```ts
class LocalCollection extends SynchronizableCollection {
  countAll(): number | Promise<number> {
    // Count collection documents.
    return 100;
  }
  initialize(): Promise<void> {
    // Executes async logic to initialize collection or datastore (open file, create database connection, etc).
  }
  findByIds(ids: DocId[]): SyncItem[] | Promise<SyncItem[]> {
    const docs = [
      { /* Doc from DB */ },
      { /* Doc from DB */ },
      { /* Doc from DB */ }
    ];
    return docs.map(d => new CustomItem(d)); // Convert to CustomItem.
  }
  syncBatch(items: SyncItem[]): SyncItem[] | Promise<SyncItem[]> {
    // Implement batch upsert/delete of records.
  }
  itemsNewerThan(date: Date | undefined, limit: number): SyncItem[] | Promise<SyncItem[]> {
    // Returns a list of items that have updatedAt greater than argument provided.
    // The list MUST be ordered by updatedAt ASC, otherwise an exception will be
    // thrown (no syncing will be executed).
  }
  latestUpdatedItem(): SyncItem | Promise<SyncItem | undefined> | undefined {
    // Gets the highest updateAt date in the collection.
  }
}
```

All methods allow the use of `async/await` if needed.

Next, implement a class that communicates with the remote collection (datastore).

In cases where the local collection is a database in a mobile app, you don't want to connect directly to a remote database, but instead you'd have to prepare a backend API to connect to, which provides the operations needed (syncBatch, findByIds, etc). This class must work as a communication layer between the client and that API.

If both collections are inside a private/secure network, then connecting directly to another database would be fine.

```ts
class RemoteCollection extends SynchronizableCollection {
  countAll(): number | Promise<number> {
    // Execute some API call to
    // https://your_server.com/api/users/count_all
    // and return its value here.
  }
  initialize(): Promise<void> {
    // ...
  }
  findByIds(ids: DocId[]): SyncItem[] | Promise<SyncItem[]> {
    // ...
  }
  syncBatch(items: SyncItem[]): SyncItem[] | Promise<SyncItem[]> {
    // ...
  }
  itemsNewerThan(date: Date | undefined, limit: number): SyncItem[] | Promise<SyncItem[]> {
    // ...
  }
  latestUpdatedItem(): SyncItem | Promise<SyncItem | undefined> | undefined {
    // ...
  }
}
```

Finally, implement a mechanism to store and retrieve two dates (last fetch and post dates).

A persistent storage is recommended.

```ts
class MySyncMetadata extends CollectionSyncMetadata{
  setLastFetchAt(d: Date): void {
    // ...
  }
  setLastPostAt(d: Date): void {
    // ...
  }
  getLastFetchAt(): Date | Promise<Date | undefined> | undefined {
    // ...
  }
  getLastPostAt(): Date | Promise<Date | undefined> | undefined {
    // ...
  }
  initialize(): Promise<void> {
    // ...
  }
}
```

Note that both classes have a `initialize` method. Some storage mechanisms require to open a file, create a DB connection, or do some asynchronous logic before beginning to use them. You can put that logic there.

In this example, however, we'll import and use [BasicSyncMetadata](/docs/classes/BasicSyncMetadata.md), which provides an in-memory storage for synchronization metadata. This is the simplest way to get started.

Add a new import to the top of the file:

```ts
import { BasicSyncMetadata } from "collection-sync";
```

Then, create two synchronization metadata managers:

```ts
const syncMetadataSlave: CollectionSyncMetadata = new BasicSyncMetadata();
const syncMetadataMaster: CollectionSyncMetadata = new BasicSyncMetadata();
```

Now, create two collections:

```ts
const collectionSlave = new LocalCollection(syncMetadataSlave);
const collectionMaster = new RemoteCollection(syncMetadataMaster);
```

Since only the slave keeps track of sync metadata, the master doesn't need a `CollectionSyncMetadata` object. However, since all collections could potentially have a master, it is a required argument.

Attach the parent as master:

```ts
collectionSlave.parent = collectionMaster;
```

Note that both `collectionSlave` and `collectionMaster` simply model how your data stores are arranged. The machine where this code is running doesn't actually need to host `collectionMaster`'s data, but since the way to communicate with it was implemented (i.e. `RemoteCollection`'s methods for API communication), we still can modify its data.

If we assume that some data exists in the datastore `collectionMaster` is pointing at, and the database pointed by `collectionSlave` is empty, then we can perform a fetch to update `collectionSlave`:

```ts
collectionSlave.sync(SyncOperation.Fetch, 100, { conflictStrategy: SyncConflictStrategy.Force });
```

See [sync](/docs/classes/SynchronizableCollection.md#sync) method documentation.

When syncing, conflicts might occur, and there are a few strategies to overcome them. A conflict occurs when trying to update a record using a record with an older `updatedAt`. In general, when synchronizing data collections, older data should be overwritten by newer data, but sometimes this is not the case, and that's when a conflict is generated. See [SyncConflictStrategy](/docs/enums/SyncConflictStrategy.md) for details.

## Another example

Note: Omitting some steps from the previous example.

```ts
const android = new LocalCollection(new MySyncMetadata());
const pc = new LocalCollection(new MySyncMetadata());
const backend = new LocalCollection(new MySyncMetadata());

android.parent = backend;
pc.parent = backend;

// Data that only exists in Android devide is being pushed...
android.sync(SyncOperation.Post, 1000);

// PC device now has data that previously only the Android device had.
pc.sync(SyncOperation.Fetch, 1000);
```

In practice, you'd want to make your slave collection perform both post and fetch operations during a full sync.

When a conflict is encountered, a suggestion is to ask the user to manually select how to solve them, and then trigger a new synchronization but using a different configuration (e.g. forcing data from the master collection to overwrite slave data).

## Current limitations and future work

### Locking mechanism

Locking mechanism (to prevent multiple devices from synchronizing at the same time) must be implemented by the user. The addition of `acquireLock` and `releaseLock` abstract methods to 'SynchronizableCollection' or `Collection` have been proposed.

## Develop

```bash
npm run test:watch
```
