[collection-sync](../README.md) / [Exports](../modules.md) / Collection

# Class: Collection

## Hierarchy

- **`Collection`**

  ↳ [`SynchronizableCollection`](SynchronizableCollection.md)

## Implements

- [`IInitializable`](../interfaces/IInitializable.md)

## Table of contents

### Constructors

- [constructor](Collection.md#constructor)

### Methods

- [countAll](Collection.md#countall)
- [findByIds](Collection.md#findbyids)
- [initialize](Collection.md#initialize)
- [itemsNewerThan](Collection.md#itemsnewerthan)
- [latestUpdatedItem](Collection.md#latestupdateditem)
- [syncBatch](Collection.md#syncbatch)

## Constructors

### constructor

• **new Collection**()

## Methods

### countAll

▸ `Abstract` **countAll**(): `number` \| `Promise`<`number`\>

Gets the number of items in the collection.

#### Returns

`number` \| `Promise`<`number`\>

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

#### Defined in

[Collection.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L14)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Implementation of

[IInitializable](../interfaces/IInitializable.md).[initialize](../interfaces/IInitializable.md#initialize)

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

#### Defined in

[Collection.ts:25](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L25)

___

### latestUpdatedItem

▸ `Abstract` **latestUpdatedItem**(): `undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`SyncItem`](SyncItem.md) \| `Promise`<`undefined` \| [`SyncItem`](SyncItem.md)\>

#### Defined in

[Collection.ts:30](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L30)

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

#### Defined in

[Collection.ts:19](https://github.com/ChrisVilches/Collection-Sync/blob/7ba4c6e/src/Collection.ts#L19)
