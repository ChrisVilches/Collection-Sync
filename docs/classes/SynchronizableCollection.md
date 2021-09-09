[collection-sync](../README.md) / [Exports](../modules.md) / SynchronizableCollection

# Class: SynchronizableCollection

## Hierarchy

- [`Collection`](Collection.md)

  ↳ **`SynchronizableCollection`**

## Table of contents

### Constructors

- [constructor](SynchronizableCollection.md#constructor)

### Properties

- [\_parent](SynchronizableCollection.md#_parent)
- [defaultSyncOptions](SynchronizableCollection.md#defaultsyncoptions)
- [lastSyncedItem](SynchronizableCollection.md#lastsynceditem)
- [syncMetadata](SynchronizableCollection.md#syncmetadata)

### Accessors

- [parent](SynchronizableCollection.md#parent)

### Methods

- [areItemsSorted](SynchronizableCollection.md#areitemssorted)
- [countAll](SynchronizableCollection.md#countall)
- [findByIds](SynchronizableCollection.md#findbyids)
- [initialize](SynchronizableCollection.md#initialize)
- [itemsNewerThan](SynchronizableCollection.md#itemsnewerthan)
- [itemsToFetch](SynchronizableCollection.md#itemstofetch)
- [itemsToPost](SynchronizableCollection.md#itemstopost)
- [itemsToSync](SynchronizableCollection.md#itemstosync)
- [latestUpdatedItem](SynchronizableCollection.md#latestupdateditem)
- [needsSync](SynchronizableCollection.md#needssync)
- [sync](SynchronizableCollection.md#sync)
- [syncBatch](SynchronizableCollection.md#syncbatch)
- [syncItems](SynchronizableCollection.md#syncitems)

## Constructors

### constructor

• **new SynchronizableCollection**(`syncMetadata`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncMetadata` | [`CollectionSyncMetadata`](CollectionSyncMetadata.md) |

#### Overrides

[Collection](Collection.md).[constructor](Collection.md#constructor)

#### Defined in

[SynchronizableCollection.ts:24](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L24)

## Properties

### \_parent

• `Private` `Optional` **\_parent**: [`SynchronizableCollection`](SynchronizableCollection.md)

#### Defined in

[SynchronizableCollection.ts:17](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L17)

___

### defaultSyncOptions

• `Protected` `Readonly` **defaultSyncOptions**: `SyncOptions`

#### Defined in

[SynchronizableCollection.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L13)

___

### lastSyncedItem

• `Private` `Optional` **lastSyncedItem**: [`SyncItem`](SyncItem.md)

Used to keep state of sync process.

#### Defined in

[SynchronizableCollection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L20)

___

### syncMetadata

• **syncMetadata**: [`CollectionSyncMetadata`](CollectionSyncMetadata.md)

#### Defined in

[SynchronizableCollection.ts:22](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L22)

## Accessors

### parent

• `get` **parent**(): `undefined` \| [`SynchronizableCollection`](SynchronizableCollection.md)

#### Returns

`undefined` \| [`SynchronizableCollection`](SynchronizableCollection.md)

#### Defined in

[SynchronizableCollection.ts:33](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L33)

• `set` **parent**(`p`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `undefined` \| [`SynchronizableCollection`](SynchronizableCollection.md) |

#### Returns

`void`

#### Defined in

[SynchronizableCollection.ts:29](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L29)

## Methods

### areItemsSorted

▸ `Private` **areItemsSorted**(`items`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`SyncItem`](SyncItem.md)[] |

#### Returns

`boolean`

#### Defined in

[SynchronizableCollection.ts:97](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L97)

___

### countAll

▸ `Abstract` **countAll**(): `number` \| `Promise`<`number`\>

Gets the number of items in the collection.

#### Returns

`number` \| `Promise`<`number`\>

#### Inherited from

[Collection](Collection.md).[countAll](Collection.md#countall)

#### Defined in

[Collection.ts:9](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L9)

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

#### Inherited from

[Collection](Collection.md).[findByIds](Collection.md#findbyids)

#### Defined in

[Collection.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L14)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Inherited from

[Collection](Collection.md).[initialize](Collection.md#initialize)

#### Defined in

[Collection.ts:11](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L11)

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

#### Inherited from

[Collection](Collection.md).[itemsNewerThan](Collection.md#itemsnewerthan)

#### Defined in

[Collection.ts:25](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L25)

___

### itemsToFetch

▸ `Private` **itemsToFetch**(`limit`): `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `limit` | `number` |

#### Returns

`Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:52](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L52)

___

### itemsToPost

▸ `Private` **itemsToPost**(`limit`): `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `limit` | `number` |

#### Returns

`Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:57](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L57)

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

[SynchronizableCollection.ts:63](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L63)

___

### latestUpdatedItem

▸ `Abstract` **latestUpdatedItem**(): `undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

#### Inherited from

[Collection](Collection.md).[latestUpdatedItem](Collection.md#latestupdateditem)

#### Defined in

[Collection.ts:30](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L30)

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

[SynchronizableCollection.ts:37](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L37)

___

### sync

▸ **sync**(`syncOperation`, `limit`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `limit` | `number` |
| `options` | `SyncOptions` |

#### Returns

`Promise`<`void`\>

#### Defined in

[SynchronizableCollection.ts:80](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L80)

___

### syncBatch

▸ `Abstract` **syncBatch**(`items`): [`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

Syncs (upsert/delete) a batch (list) of items into this collection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`SyncItem`](SyncItem.md)[] |

#### Returns

[`SyncItem`](SyncItem.md)[] \| `Promise`<[`SyncItem`](SyncItem.md)[]\>

#### Inherited from

[Collection](Collection.md).[syncBatch](Collection.md#syncbatch)

#### Defined in

[Collection.ts:19](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L19)

___

### syncItems

▸ **syncItems**(`items`, `syncOperation`, `options`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`SyncItem`](SyncItem.md)[] |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `options` | `SyncOptions` |

#### Returns

`Promise`<`void`\>

#### Defined in

[SynchronizableCollection.ts:109](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/SynchronizableCollection.ts#L109)
