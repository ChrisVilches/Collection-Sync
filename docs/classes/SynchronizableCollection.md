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
- [syncItems](SynchronizableCollection.md#syncitems)
- [upsertBatch](SynchronizableCollection.md#upsertbatch)

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

[SynchronizableCollection.ts:24](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L24)

## Properties

### \_parent

• `Private` `Optional` **\_parent**: [`SynchronizableCollection`](SynchronizableCollection.md)

#### Defined in

[SynchronizableCollection.ts:17](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L17)

___

### defaultSyncOptions

• `Protected` `Readonly` **defaultSyncOptions**: `SyncOptions`

#### Defined in

[SynchronizableCollection.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L13)

___

### lastSyncedItem

• `Private` `Optional` **lastSyncedItem**: [`CollectionItem`](CollectionItem.md)

Used to keep state of sync process.

#### Defined in

[SynchronizableCollection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L20)

___

### syncMetadata

• **syncMetadata**: [`CollectionSyncMetadata`](CollectionSyncMetadata.md)

#### Defined in

[SynchronizableCollection.ts:22](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L22)

## Accessors

### parent

• `get` **parent**(): `undefined` \| [`SynchronizableCollection`](SynchronizableCollection.md)

#### Returns

`undefined` \| [`SynchronizableCollection`](SynchronizableCollection.md)

#### Defined in

[SynchronizableCollection.ts:33](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L33)

• `set` **parent**(`p`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `undefined` \| [`SynchronizableCollection`](SynchronizableCollection.md) |

#### Returns

`void`

#### Defined in

[SynchronizableCollection.ts:29](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L29)

## Methods

### areItemsSorted

▸ `Private` **areItemsSorted**(`items`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`CollectionItem`](CollectionItem.md)[] |

#### Returns

`boolean`

#### Defined in

[SynchronizableCollection.ts:97](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L97)

___

### countAll

▸ `Abstract` **countAll**(): `number` \| `Promise`<`number`\>

#### Returns

`number` \| `Promise`<`number`\>

#### Inherited from

[Collection](Collection.md).[countAll](Collection.md#countall)

#### Defined in

[Collection.ts:7](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/Collection.ts#L7)

___

### findByIds

▸ `Abstract` **findByIds**(`ids`): [`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `DocId`[] |

#### Returns

[`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Inherited from

[Collection](Collection.md).[findByIds](Collection.md#findbyids)

#### Defined in

[Collection.ts:12](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/Collection.ts#L12)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Inherited from

[Collection](Collection.md).[initialize](Collection.md#initialize)

#### Defined in

[Collection.ts:9](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/Collection.ts#L9)

___

### itemsNewerThan

▸ `Abstract` **itemsNewerThan**(`date`, `limit`): [`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

Returns a list of items that have `updatedAt` greater than argument provided.
The list MUST be ordered by `updatedAt ASC`, otherwise an exception will be thrown (no syncing
will be executed).

#### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `undefined` \| `Date` |
| `limit` | `number` |

#### Returns

[`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Inherited from

[Collection](Collection.md).[itemsNewerThan](Collection.md#itemsnewerthan)

#### Defined in

[Collection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/Collection.ts#L20)

___

### itemsToFetch

▸ `Private` **itemsToFetch**(`limit`): `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `limit` | `number` |

#### Returns

`Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:52](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L52)

___

### itemsToPost

▸ `Private` **itemsToPost**(`limit`): `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `limit` | `number` |

#### Returns

`Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:57](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L57)

___

### itemsToSync

▸ **itemsToSync**(`syncOperation`, `limit`): `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

Gets list of items that can be synced (to either fetch or post).

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `limit` | `number` |

#### Returns

`Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Defined in

[SynchronizableCollection.ts:63](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L63)

___

### latestUpdatedItem

▸ `Abstract` **latestUpdatedItem**(): `undefined` \| [`CollectionItem`](CollectionItem.md) \| `Promise`<`undefined` \| [`CollectionItem`](CollectionItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`CollectionItem`](CollectionItem.md) \| `Promise`<`undefined` \| [`CollectionItem`](CollectionItem.md)\>

#### Inherited from

[Collection](Collection.md).[latestUpdatedItem](Collection.md#latestupdateditem)

#### Defined in

[Collection.ts:25](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/Collection.ts#L25)

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

[SynchronizableCollection.ts:37](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L37)

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

[SynchronizableCollection.ts:80](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L80)

___

### syncItems

▸ **syncItems**(`items`, `syncOperation`, `options`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`CollectionItem`](CollectionItem.md)[] |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |
| `options` | `SyncOptions` |

#### Returns

`Promise`<`void`\>

#### Defined in

[SynchronizableCollection.ts:109](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/SynchronizableCollection.ts#L109)

___

### upsertBatch

▸ `Abstract` **upsertBatch**(`items`): [`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`CollectionItem`](CollectionItem.md)[] |

#### Returns

[`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Inherited from

[Collection](Collection.md).[upsertBatch](Collection.md#upsertbatch)

#### Defined in

[Collection.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/Collection.ts#L14)
