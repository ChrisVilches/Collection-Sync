[collection-sync](../README.md) / [Exports](../modules.md) / BasicSyncMetadata

# Class: BasicSyncMetadata

A simple sync metadata manager.

## Hierarchy

- [`CollectionSyncMetadata`](CollectionSyncMetadata.md)

  ↳ **`BasicSyncMetadata`**

## Table of contents

### Constructors

- [constructor](BasicSyncMetadata.md#constructor)

### Properties

- [\_lastFetchAt](BasicSyncMetadata.md#_lastfetchat)
- [\_lastPostAt](BasicSyncMetadata.md#_lastpostat)

### Methods

- [getLastAt](BasicSyncMetadata.md#getlastat)
- [getLastFetchAt](BasicSyncMetadata.md#getlastfetchat)
- [getLastPostAt](BasicSyncMetadata.md#getlastpostat)
- [initialize](BasicSyncMetadata.md#initialize)
- [setLastAt](BasicSyncMetadata.md#setlastat)
- [setLastFetchAt](BasicSyncMetadata.md#setlastfetchat)
- [setLastPostAt](BasicSyncMetadata.md#setlastpostat)

## Constructors

### constructor

• **new BasicSyncMetadata**(`lastFetchAt?`, `lastPostAt?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `lastFetchAt?` | `Date` |
| `lastPostAt?` | `Date` |

#### Overrides

[CollectionSyncMetadata](CollectionSyncMetadata.md).[constructor](CollectionSyncMetadata.md#constructor)

#### Defined in

[example-implementations/BasicSyncMetadata.ts:8](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L8)

## Properties

### \_lastFetchAt

• `Private` `Optional` **\_lastFetchAt**: `Date`

#### Defined in

[example-implementations/BasicSyncMetadata.ts:5](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L5)

___

### \_lastPostAt

• `Private` `Optional` **\_lastPostAt**: `Date`

#### Defined in

[example-implementations/BasicSyncMetadata.ts:6](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L6)

## Methods

### getLastAt

▸ **getLastAt**(`syncOperation`): `Promise`<`undefined` \| `Date`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `syncOperation` | [`SyncOperation`](../enums/SyncOperation.md) |

#### Returns

`Promise`<`undefined` \| `Date`\>

#### Inherited from

[CollectionSyncMetadata](CollectionSyncMetadata.md).[getLastAt](CollectionSyncMetadata.md#getlastat)

#### Defined in

[CollectionSyncMetadata.ts:21](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/CollectionSyncMetadata.ts#L21)

___

### getLastFetchAt

▸ **getLastFetchAt**(): `undefined` \| `Date`

#### Returns

`undefined` \| `Date`

#### Overrides

[CollectionSyncMetadata](CollectionSyncMetadata.md).[getLastFetchAt](CollectionSyncMetadata.md#getlastfetchat)

#### Defined in

[example-implementations/BasicSyncMetadata.ts:25](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L25)

___

### getLastPostAt

▸ **getLastPostAt**(): `undefined` \| `Date`

#### Returns

`undefined` \| `Date`

#### Overrides

[CollectionSyncMetadata](CollectionSyncMetadata.md).[getLastPostAt](CollectionSyncMetadata.md#getlastpostat)

#### Defined in

[example-implementations/BasicSyncMetadata.ts:29](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L29)

___

### initialize

▸ **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Overrides

[CollectionSyncMetadata](CollectionSyncMetadata.md).[initialize](CollectionSyncMetadata.md#initialize)

#### Defined in

[example-implementations/BasicSyncMetadata.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L14)

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

#### Inherited from

[CollectionSyncMetadata](CollectionSyncMetadata.md).[setLastAt](CollectionSyncMetadata.md#setlastat)

#### Defined in

[CollectionSyncMetadata.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/CollectionSyncMetadata.ts#L13)

___

### setLastFetchAt

▸ **setLastFetchAt**(`d`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `Date` |

#### Returns

`void`

#### Overrides

[CollectionSyncMetadata](CollectionSyncMetadata.md).[setLastFetchAt](CollectionSyncMetadata.md#setlastfetchat)

#### Defined in

[example-implementations/BasicSyncMetadata.ts:17](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L17)

___

### setLastPostAt

▸ **setLastPostAt**(`d`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `Date` |

#### Returns

`void`

#### Overrides

[CollectionSyncMetadata](CollectionSyncMetadata.md).[setLastPostAt](CollectionSyncMetadata.md#setlastpostat)

#### Defined in

[example-implementations/BasicSyncMetadata.ts:21](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/example-implementations/BasicSyncMetadata.ts#L21)
