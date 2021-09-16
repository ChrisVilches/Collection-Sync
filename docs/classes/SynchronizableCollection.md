[collection-sync](../README.md) / [Exports](../modules.md) / SynchronizableCollection

# Class: SynchronizableCollection

## Implements

- [`Collection`](../interfaces/Collection.md)

## Table of contents

### Constructors

- [constructor](SynchronizableCollection.md#constructor)

### Properties

- [\_parent](SynchronizableCollection.md#_parent)
- [defaultSyncOptions](SynchronizableCollection.md#defaultsyncoptions)
- [syncMetadata](SynchronizableCollection.md#syncmetadata)
- [synchronizers](SynchronizableCollection.md#synchronizers)

### Accessors

- [lastSynchronizer](SynchronizableCollection.md#lastsynchronizer)
- [parent](SynchronizableCollection.md#parent)

### Methods

- [cleanUp](SynchronizableCollection.md#cleanup)
- [commitSync](SynchronizableCollection.md#commitsync)
- [countAll](SynchronizableCollection.md#countall)
- [findByIds](SynchronizableCollection.md#findbyids)
- [initialize](SynchronizableCollection.md#initialize)
- [itemsNewerThan](SynchronizableCollection.md#itemsnewerthan)
- [itemsToFetch](SynchronizableCollection.md#itemstofetch)
- [itemsToPost](SynchronizableCollection.md#itemstopost)
- [itemsToSync](SynchronizableCollection.md#itemstosync)
- [latestUpdatedItem](SynchronizableCollection.md#latestupdateditem)
- [needsSync](SynchronizableCollection.md#needssync)
- [preCommitSync](SynchronizableCollection.md#precommitsync)
- [preExecuteSync](SynchronizableCollection.md#preexecutesync)
- [rollbackSync](SynchronizableCollection.md#rollbacksync)
- [sync](SynchronizableCollection.md#sync)
- [syncAux](SynchronizableCollection.md#syncaux)
- [syncBatch](SynchronizableCollection.md#syncbatch)

## Constructors

### constructor

• **new SynchronizableCollection**(`syncMetadata`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncMetadata` | [`CollectionSyncMetadata`](CollectionSyncMetadata.md) |

#### Defined in

[SynchronizableCollection.ts:24](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L24)

## Properties

### \_parent

• `Private` `Optional` **\_parent**: [`Collection`](../interfaces/Collection.md)

#### Defined in

[SynchronizableCollection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L20)

___

### defaultSyncOptions

• `Private` `Readonly` **defaultSyncOptions**: `SyncOptions`

#### Defined in

[SynchronizableCollection.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L13)

___

### syncMetadata

• **syncMetadata**: [`CollectionSyncMetadata`](CollectionSyncMetadata.md)

#### Defined in

[SynchronizableCollection.ts:22](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L22)

___

### synchronizers

• `Private` **synchronizers**: `Synchronizer`[] = `[]`

Store history of sync operations.

#### Defined in

[SynchronizableCollection.ts:18](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L18)

## Accessors

### lastSynchronizer

• `get` **lastSynchronizer**(): `undefined` \| `Synchronizer`

#### Returns

`undefined` \| `Synchronizer`

#### Defined in

[SynchronizableCollection.ts:77](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L77)

___

### parent

• `get` **parent**(): `undefined` \| [`Collection`](../interfaces/Collection.md)

#### Returns

`undefined` \| [`Collection`](../interfaces/Collection.md)

#### Defined in

[SynchronizableCollection.ts:73](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L73)

• `set` **parent**(`p`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `undefined` \| [`Collection`](../interfaces/Collection.md) |

#### Returns

`void`

#### Defined in

[SynchronizableCollection.ts:69](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L69)

## Methods

### cleanUp

▸ **cleanUp**(`_synchronizer`): `Promise`<`void`\>

Executed at the end of each sync operation (whether it succeeded or not).
It's recommended to implement cleaning logic if necessary.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_synchronizer` | `Synchronizer` |

#### Returns

`Promise`<`void`\>

#### Defined in

[SynchronizableCollection.ts:63](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L63)

___

### commitSync

▸ **commitSync**(`_itemsToSync`, `_ignoredItems`, `_conflictItems`): `Promise`<`boolean`\>

Commits the sync operation. Database engines that don't support
this should implement a method that returns `true` (because the
data was already added without the need for a commit statement).
Make sure to commit the data from one specific sync process in order to avoid committing data
pushed by multiple users synchronizing at the same time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_itemsToSync` | [`SyncItem`](SyncItem.md)[] |
| `_ignoredItems` | [`SyncItem`](SyncItem.md)[] |
| `_conflictItems` | [`SyncItem`](SyncItem.md)[] |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Collection](../interfaces/Collection.md).[commitSync](../interfaces/Collection.md#commitsync)

#### Defined in

[SynchronizableCollection.ts:52](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L52)

___

### countAll

▸ `Abstract` **countAll**(): `number` \| `Promise`<`number`\>

Gets the number of items in the collection.

#### Returns

`number` \| `Promise`<`number`\>

#### Implementation of

[Collection](../interfaces/Collection.md).[countAll](../interfaces/Collection.md#countall)

#### Defined in

[SynchronizableCollection.ts:28](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L28)

___

### findByIds

▸ `Abstract` **findByIds**(`ids`): [`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

Returns a list of records using an ID list as search query.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `DocId`[] |

#### Returns

[`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Implementation of

[Collection](../interfaces/Collection.md).[findByIds](../interfaces/Collection.md#findbyids)

#### Defined in

[SynchronizableCollection.ts:29](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L29)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Implementation of

[Collection](../interfaces/Collection.md).[initialize](../interfaces/Collection.md#initialize)

#### Defined in

[SynchronizableCollection.ts:33](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L33)

___

### itemsNewerThan

▸ `Abstract` **itemsNewerThan**(`date`, `limit`): [`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

Returns a list of items that have `updatedAt` greater than argument provided.
The list MUST be ordered by `updatedAt ASC`, otherwise an exception will be thrown (no syncing
will be executed).

#### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `undefined` \| `Date` |
| `limit` | `number` |

#### Returns

[`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Implementation of

[Collection](../interfaces/Collection.md).[itemsNewerThan](../interfaces/Collection.md#itemsnewerthan)

#### Defined in

[SynchronizableCollection.ts:31](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L31)

___

### itemsToFetch

▸ `Private` **itemsToFetch**(`lastSyncAt`, `limit`): `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `lastSyncAt` | `undefined` \| `Date` |
| `limit` | `number` |

#### Returns

`Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:115](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L115)

___

### itemsToPost

▸ `Private` **itemsToPost**(`lastSyncAt`, `limit`): `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `lastSyncAt` | `undefined` \| `Date` |
| `limit` | `number` |

#### Returns

`Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:119](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L119)

___

### itemsToSync

▸ **itemsToSync**(`syncOperation`, `limit`): `Promise`<[`SyncItem`](SyncItem.md)[]\>

Gets list of items that can be synced (to either fetch or post).

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `limit` | `number` |

#### Returns

`Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:124](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L124)

___

### latestUpdatedItem

▸ `Abstract` **latestUpdatedItem**(): `undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

#### Implementation of

[Collection](../interfaces/Collection.md).[latestUpdatedItem](../interfaces/Collection.md#latestupdateditem)

#### Defined in

[SynchronizableCollection.ts:32](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L32)

___

### needsSync

▸ **needsSync**(`syncOperation`): `Promise`<`boolean`\>

Determines if synchronization is needed. This only performs a simple date check
to see if the source collection has at least one item that's newer than the last
sync date. This doesn't determine if items are actually different from those in the
destination collection. This means that even if this method returns `true`, there may
be occasions where no item is actually synced because they were identical. Checking which
items have actually changed is more expensive, and usually it's recommended to be done
while executing the actual sync, and in small batches (the last sync date is updated after
every batch, meaning that after enough sync operations, this method will begin to return `false`).

One example of this can be seen when the local collection posts an item to the parent collection,
updating the last post date, but not the fetch date. Then, when checking if fetch is necessary,
it will return `true` because it just posted a new object and only based on dates, it will determine
that the item has not been fetched yet. However when executing the fetch operation, all items
will be ignored because that new item from the server collection is the same as the one in the
local collection (since it was the local collection which posted it in the first place). This happens
because last fetch and post dates are updated individually.

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[SynchronizableCollection.ts:100](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L100)

___

### preCommitSync

▸ **preCommitSync**(`_synchronizer`): `Promise`<`boolean`\>

Executes before committing the data. If this method returns `false`, then committing will
be aborted. It will only commit the data if the return value is `true`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_synchronizer` | `Synchronizer` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[SynchronizableCollection.ts:48](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L48)

___

### preExecuteSync

▸ **preExecuteSync**(`_synchronizer`): `Promise`<`boolean`\>

Executes before starting to send the data to the destination collection.
If this method returns `false`, syncing will be aborted, and will continue only if
the return value is `true`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_synchronizer` | `Synchronizer` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[SynchronizableCollection.ts:40](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L40)

___

### rollbackSync

▸ **rollbackSync**(`_itemsToSync`, `_ignoredItems`, `_conflictItems`): `Promise`<`void`\>

Rollbacks the current data that's being synchronized.
Make sure to rollback the data from one specific sync process in order to avoid discarding data
pushed by multiple users synchronizing at the same time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_itemsToSync` | [`SyncItem`](SyncItem.md)[] |
| `_ignoredItems` | [`SyncItem`](SyncItem.md)[] |
| `_conflictItems` | [`SyncItem`](SyncItem.md)[] |

#### Returns

`Promise`<`void`\>

#### Implementation of

[Collection](../interfaces/Collection.md).[rollbackSync](../interfaces/Collection.md#rollbacksync)

#### Defined in

[SynchronizableCollection.ts:56](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L56)

___

### sync

▸ **sync**(`syncOperation`, `limit`, `options?`, `date?`): `Promise`<`Synchronizer`\>

Wraps sync operation so that `cleanUp` and `rollback` are conveniently placed at the end
and always executed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `limit` | `number` |
| `options` | `SyncOptions` |
| `date?` | `Date` |

#### Returns

`Promise`<`Synchronizer`\>

#### Defined in

[SynchronizableCollection.ts:147](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L147)

___

### syncAux

▸ `Private` **syncAux**(`synchronizer`, `syncOperation`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `synchronizer` | `Synchronizer` |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[SynchronizableCollection.ts:173](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L173)

___

### syncBatch

▸ `Abstract` **syncBatch**(`items`): [`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

Syncs (upsert/delete) a batch (list) of items into this collection.
Order of document processing doesn't need to be in any particular order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`SyncItem`](SyncItem.md)[] |

#### Returns

[`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Implementation of

[Collection](../interfaces/Collection.md).[syncBatch](../interfaces/Collection.md#syncbatch)

#### Defined in

[SynchronizableCollection.ts:30](https://github.com/ChrisVilches/Collection-Sync/blob/0dbe0dc/src/SynchronizableCollection.ts#L30)
