[collection-sync](../README.md) / [Exports](../modules.md) / Collection

# Interface: Collection

This interface defines several CRUD methods to operate on a collection.
These methods can be implemented by accessing a local database, requesting a restful API (remote DB), etc.

## Hierarchy

- [`IInitializable`](IInitializable.md)

  ↳ **`Collection`**

## Implemented by

- [`SynchronizableCollection`](../classes/SynchronizableCollection.md)

## Table of contents

### Methods

- [commitSync](Collection.md#commitsync)
- [countAll](Collection.md#countall)
- [findByIds](Collection.md#findbyids)
- [initialize](Collection.md#initialize)
- [itemsNewerThan](Collection.md#itemsnewerthan)
- [latestUpdatedItem](Collection.md#latestupdateditem)
- [rollbackSync](Collection.md#rollbacksync)
- [syncBatch](Collection.md#syncbatch)

## Methods

### commitSync

▸ **commitSync**(`itemsToSync`, `ignoredItems`, `conflictItems`): `Promise`<`boolean`\>

Commits the sync operation. Database engines that don't support
this should implement a method that returns `true` (because the
data was already added without the need for a commit statement).
Make sure to commit the data from one specific sync process in order to avoid committing data
pushed by multiple users synchronizing at the same time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `itemsToSync` | [`SyncItem`](../classes/SyncItem.md)[] |
| `ignoredItems` | [`SyncItem`](../classes/SyncItem.md)[] |
| `conflictItems` | [`SyncItem`](../classes/SyncItem.md)[] |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[Collection.ts:44](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L44)

___

### countAll

▸ **countAll**(): `number` \| `Promise`<`number`\>

Gets the number of items in the collection.

#### Returns

`number` \| `Promise`<`number`\>

#### Defined in

[Collection.ts:11](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L11)

___

### findByIds

▸ **findByIds**(`ids`): [`SyncItem`](../classes/SyncItem.md)[] \| `Promise`<[`SyncItem`](../classes/SyncItem.md)[]\>

Returns a list of records using an ID list as search query.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `DocId`[] |

#### Returns

[`SyncItem`](../classes/SyncItem.md)[] \| `Promise`<[`SyncItem`](../classes/SyncItem.md)[]\>

#### Defined in

[Collection.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L14)

___

### initialize

▸ **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Inherited from

[IInitializable](IInitializable.md).[initialize](IInitializable.md#initialize)

#### Defined in

[IInitializable.ts:3](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/IInitializable.ts#L3)

___

### itemsNewerThan

▸ **itemsNewerThan**(`date`, `limit`): [`SyncItem`](../classes/SyncItem.md)[] \| `Promise`<[`SyncItem`](../classes/SyncItem.md)[]\>

Returns a list of items that have `updatedAt` greater than argument provided.
The list MUST be ordered by `updatedAt ASC`, otherwise an exception will be thrown (no syncing
will be executed).

#### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `undefined` \| `Date` |
| `limit` | `number` |

#### Returns

[`SyncItem`](../classes/SyncItem.md)[] \| `Promise`<[`SyncItem`](../classes/SyncItem.md)[]\>

#### Defined in

[Collection.ts:26](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L26)

___

### latestUpdatedItem

▸ **latestUpdatedItem**(): `undefined` \| [`SyncItem`](../classes/SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](../classes/SyncItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`SyncItem`](../classes/SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](../classes/SyncItem.md)\>

#### Defined in

[Collection.ts:31](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L31)

___

### rollbackSync

▸ **rollbackSync**(`itemsToSync`, `ignoredItems`, `conflictItems`): `void` \| `Promise`<`void`\>

Rollbacks the current data that's being synchronized.
Make sure to rollback the data from one specific sync process in order to avoid discarding data
pushed by multiple users synchronizing at the same time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `itemsToSync` | [`SyncItem`](../classes/SyncItem.md)[] |
| `ignoredItems` | [`SyncItem`](../classes/SyncItem.md)[] |
| `conflictItems` | [`SyncItem`](../classes/SyncItem.md)[] |

#### Returns

`void` \| `Promise`<`void`\>

#### Defined in

[Collection.ts:51](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L51)

___

### syncBatch

▸ **syncBatch**(`items`): [`SyncItem`](../classes/SyncItem.md)[] \| `Promise`<[`SyncItem`](../classes/SyncItem.md)[]\>

Syncs (upsert/delete) a batch (list) of items into this collection.
Order of document processing doesn't need to be in any particular order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`SyncItem`](../classes/SyncItem.md)[] |

#### Returns

[`SyncItem`](../classes/SyncItem.md)[] \| `Promise`<[`SyncItem`](../classes/SyncItem.md)[]\>

#### Defined in

[Collection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/Collection.ts#L20)
