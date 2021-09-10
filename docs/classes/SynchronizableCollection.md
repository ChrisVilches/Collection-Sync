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

[SynchronizableCollection.ts:24](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L24)

## Properties

### \_parent

• `Private` `Optional` **\_parent**: [`Collection`](../interfaces/Collection.md)

#### Defined in

[SynchronizableCollection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L20)

___

### defaultSyncOptions

• `Private` `Readonly` **defaultSyncOptions**: `SyncOptions`

#### Defined in

[SynchronizableCollection.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L13)

___

### syncMetadata

• **syncMetadata**: [`CollectionSyncMetadata`](CollectionSyncMetadata.md)

#### Defined in

[SynchronizableCollection.ts:22](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L22)

___

### synchronizers

• `Private` **synchronizers**: `Synchronizer`[] = `[]`

Store history of sync operations.

#### Defined in

[SynchronizableCollection.ts:18](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L18)

## Accessors

### lastSynchronizer

• `get` **lastSynchronizer**(): `undefined` \| `Synchronizer`

#### Returns

`undefined` \| `Synchronizer`

#### Defined in

[SynchronizableCollection.ts:74](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L74)

___

### parent

• `get` **parent**(): `undefined` \| [`Collection`](../interfaces/Collection.md)

#### Returns

`undefined` \| [`Collection`](../interfaces/Collection.md)

#### Defined in

[SynchronizableCollection.ts:70](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L70)

• `set` **parent**(`p`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `undefined` \| [`Collection`](../interfaces/Collection.md) |

#### Returns

`void`

#### Defined in

[SynchronizableCollection.ts:66](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L66)

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

[SynchronizableCollection.ts:63](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L63)

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

[SynchronizableCollection.ts:52](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L52)

___

### countAll

▸ `Abstract` **countAll**(): `number` \| `Promise`<`number`\>

Gets the number of items in the collection.

#### Returns

`number` \| `Promise`<`number`\>

#### Implementation of

[Collection](../interfaces/Collection.md).[countAll](../interfaces/Collection.md#countall)

#### Defined in

[SynchronizableCollection.ts:28](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L28)

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

[SynchronizableCollection.ts:29](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L29)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Implementation of

[Collection](../interfaces/Collection.md).[initialize](../interfaces/Collection.md#initialize)

#### Defined in

[SynchronizableCollection.ts:33](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L33)

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

[SynchronizableCollection.ts:31](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L31)

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

[SynchronizableCollection.ts:94](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L94)

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

[SynchronizableCollection.ts:98](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L98)

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

[SynchronizableCollection.ts:103](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L103)

___

### latestUpdatedItem

▸ `Abstract` **latestUpdatedItem**(): `undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

#### Implementation of

[Collection](../interfaces/Collection.md).[latestUpdatedItem](../interfaces/Collection.md#latestupdateditem)

#### Defined in

[SynchronizableCollection.ts:32](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L32)

___

### needsSync

▸ **needsSync**(`syncOperation`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[SynchronizableCollection.ts:79](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L79)

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

[SynchronizableCollection.ts:48](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L48)

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

[SynchronizableCollection.ts:40](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L40)

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

[SynchronizableCollection.ts:56](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L56)

___

### sync

▸ **sync**(`syncOperation`, `limit`, `options?`): `Promise`<`Synchronizer`\>

Wraps sync operation so that `cleanUp` and `rollback` are conveniently placed at the end
and always executed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `limit` | `number` |
| `options` | `SyncOptions` |

#### Returns

`Promise`<`Synchronizer`\>

#### Defined in

[SynchronizableCollection.ts:126](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L126)

___

### syncAux

▸ **syncAux**(`synchronizer`, `syncOperation`, `limit`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `synchronizer` | `Synchronizer` |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `limit` | `number` |
| `options` | `SyncOptions` |

#### Returns

`Promise`<`void`\>

#### Defined in

[SynchronizableCollection.ts:150](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L150)

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

[SynchronizableCollection.ts:30](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SynchronizableCollection.ts#L30)
