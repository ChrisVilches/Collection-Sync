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
- [upsertBatch](Collection.md#upsertbatch)

## Constructors

### constructor

• **new Collection**()

## Methods

### countAll

▸ `Abstract` **countAll**(): `number` \| `Promise`<`number`\>

#### Returns

`number` \| `Promise`<`number`\>

#### Defined in

[Collection.ts:7](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/Collection.ts#L7)

___

### findByIds

▸ `Abstract` **findByIds**(`ids`): [`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `DocId`[] |

#### Returns

[`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Defined in

[Collection.ts:12](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/Collection.ts#L12)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Implementation of

[IInitializable](../interfaces/IInitializable.md).[initialize](../interfaces/IInitializable.md#initialize)

#### Defined in

[Collection.ts:9](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/Collection.ts#L9)

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

#### Defined in

[Collection.ts:20](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/Collection.ts#L20)

___

### latestUpdatedItem

▸ `Abstract` **latestUpdatedItem**(): `undefined` \| [`CollectionItem`](CollectionItem.md) \| `Promise`<`undefined` \| [`CollectionItem`](CollectionItem.md)\>

Gets the highest `updateAt` date in the collection.

#### Returns

`undefined` \| [`CollectionItem`](CollectionItem.md) \| `Promise`<`undefined` \| [`CollectionItem`](CollectionItem.md)\>

#### Defined in

[Collection.ts:25](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/Collection.ts#L25)

___

### upsertBatch

▸ `Abstract` **upsertBatch**(`items`): [`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | [`CollectionItem`](CollectionItem.md)[] |

#### Returns

[`CollectionItem`](CollectionItem.md)[] \| `Promise`<[`CollectionItem`](CollectionItem.md)[]\>

#### Defined in

[Collection.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/Collection.ts#L14)
