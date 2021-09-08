[collection-sync](../README.md) / [Exports](../modules.md) / CollectionSyncMetadata

# Class: CollectionSyncMetadata

## Hierarchy

- **`CollectionSyncMetadata`**

  ↳ [`BasicSyncMetadata`](BasicSyncMetadata.md)

## Implements

- [`IInitializable`](../interfaces/IInitializable.md)

## Table of contents

### Constructors

- [constructor](CollectionSyncMetadata.md#constructor)

### Methods

- [getLastAt](CollectionSyncMetadata.md#getlastat)
- [getLastFetchAt](CollectionSyncMetadata.md#getlastfetchat)
- [getLastPostAt](CollectionSyncMetadata.md#getlastpostat)
- [initialize](CollectionSyncMetadata.md#initialize)
- [setLastAt](CollectionSyncMetadata.md#setlastat)
- [setLastFetchAt](CollectionSyncMetadata.md#setlastfetchat)
- [setLastPostAt](CollectionSyncMetadata.md#setlastpostat)

## Constructors

### constructor

• **new CollectionSyncMetadata**()

## Methods

### getLastAt

▸ **getLastAt**(`syncOperation`): `Promise`<`undefined` \| `Date`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |

#### Returns

`Promise`<`undefined` \| `Date`\>

#### Defined in

[CollectionSyncMetadata.ts:21](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L21)

___

### getLastFetchAt

▸ `Abstract` **getLastFetchAt**(): `undefined` \| `Date` \| `Promise`<`undefined` \| `Date`\>

#### Returns

`undefined` \| `Date` \| `Promise`<`undefined` \| `Date`\>

#### Defined in

[CollectionSyncMetadata.ts:8](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L8)

___

### getLastPostAt

▸ `Abstract` **getLastPostAt**(): `undefined` \| `Date` \| `Promise`<`undefined` \| `Date`\>

#### Returns

`undefined` \| `Date` \| `Promise`<`undefined` \| `Date`\>

#### Defined in

[CollectionSyncMetadata.ts:9](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L9)

___

### initialize

▸ `Abstract` **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Implementation of

[IInitializable](../interfaces/IInitializable.md).[initialize](../interfaces/IInitializable.md#initialize)

#### Defined in

[CollectionSyncMetadata.ts:11](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L11)

___

### setLastAt

▸ **setLastAt**(`d`, `syncOperation`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `Date` |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[CollectionSyncMetadata.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L13)

___

### setLastFetchAt

▸ `Abstract` **setLastFetchAt**(`d`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `Date` |

#### Returns

`void`

#### Defined in

[CollectionSyncMetadata.ts:5](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L5)

___

### setLastPostAt

▸ `Abstract` **setLastPostAt**(`d`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `Date` |

#### Returns

`void`

#### Defined in

[CollectionSyncMetadata.ts:6](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionSyncMetadata.ts#L6)
