[collection-sync](../README.md) / [Exports](../modules.md) / CollectionItem

# Class: CollectionItem

Contains an ID that identifies the synchronizable object, the document data itself, and `updatedAt` (which is used to determine whether the document must be synchronized or not).

## Table of contents

### Constructors

- [constructor](CollectionItem.md#constructor)

### Properties

- [\_document](CollectionItem.md#_document)
- [\_id](CollectionItem.md#_id)
- [\_updatedAt](CollectionItem.md#_updatedat)

### Accessors

- [document](CollectionItem.md#document)
- [id](CollectionItem.md#id)
- [updatedAt](CollectionItem.md#updatedat)

### Methods

- [update](CollectionItem.md#update)

## Constructors

### constructor

• **new CollectionItem**(`id`, `document`, `updatedAt`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `DocId` |
| `document` | `any` |
| `updatedAt` | `Date` |

#### Defined in

[CollectionItem.ts:21](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L21)

## Properties

### \_document

• `Private` **\_document**: `any`

#### Defined in

[CollectionItem.ts:7](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L7)

___

### \_id

• `Private` **\_id**: `DocId`

#### Defined in

[CollectionItem.ts:5](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L5)

___

### \_updatedAt

• `Private` **\_updatedAt**: `Date`

#### Defined in

[CollectionItem.ts:6](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L6)

## Accessors

### document

• `get` **document**(): `any`

#### Returns

`any`

#### Defined in

[CollectionItem.ts:17](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L17)

___

### id

• `get` **id**(): `DocId`

#### Returns

`DocId`

#### Defined in

[CollectionItem.ts:9](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L9)

___

### updatedAt

• `get` **updatedAt**(): `Date`

#### Returns

`Date`

#### Defined in

[CollectionItem.ts:13](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L13)

## Methods

### update

▸ **update**(`document`, `updatedAt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | `any` |
| `updatedAt` | `Date` |

#### Returns

`void`

#### Defined in

[CollectionItem.ts:30](https://github.com/ChrisVilches/Collection-Sync/blob/75f59a1/src/CollectionItem.ts#L30)
