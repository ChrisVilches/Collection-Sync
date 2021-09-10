[collection-sync](../README.md) / [Exports](../modules.md) / SyncItem

# Class: SyncItem

Contains an ID that identifies the synchronizable object, the document data itself, and `updatedAt` (which is used to determine whether the document must be synchronized or not).

## Table of contents

### Constructors

- [constructor](SyncItem.md#constructor)

### Properties

- [\_action](SyncItem.md#_action)
- [\_document](SyncItem.md#_document)
- [\_id](SyncItem.md#_id)
- [\_updatedAt](SyncItem.md#_updatedat)

### Accessors

- [document](SyncItem.md#document)
- [id](SyncItem.md#id)
- [isDelete](SyncItem.md#isdelete)
- [isUpdate](SyncItem.md#isupdate)
- [updatedAt](SyncItem.md#updatedat)

### Methods

- [update](SyncItem.md#update)

## Constructors

### constructor

• **new SyncItem**(`id`, `document`, `updatedAt`, `action?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `DocId` |
| `document` | `any` |
| `updatedAt` | `Date` |
| `action` | `SyncItemAction` |

#### Defined in

[SyncItem.ts:33](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L33)

## Properties

### \_action

• `Private` **\_action**: `SyncItemAction`

#### Defined in

[SyncItem.ts:9](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L9)

___

### \_document

• `Private` **\_document**: `any`

#### Defined in

[SyncItem.ts:8](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L8)

___

### \_id

• `Private` **\_id**: `DocId`

#### Defined in

[SyncItem.ts:6](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L6)

___

### \_updatedAt

• `Private` **\_updatedAt**: `Date`

#### Defined in

[SyncItem.ts:7](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L7)

## Accessors

### document

• `get` **document**(): `any`

#### Returns

`any`

#### Defined in

[SyncItem.ts:19](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L19)

___

### id

• `get` **id**(): `DocId`

#### Returns

`DocId`

#### Defined in

[SyncItem.ts:11](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L11)

___

### isDelete

• `get` **isDelete**(): `boolean`

Determines whether the item should be removed from the database or not.

#### Returns

`boolean`

#### Defined in

[SyncItem.ts:29](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L29)

___

### isUpdate

• `get` **isUpdate**(): `boolean`

Determines whether the item should be updated or not.

#### Returns

`boolean`

#### Defined in

[SyncItem.ts:24](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L24)

___

### updatedAt

• `get` **updatedAt**(): `Date`

#### Returns

`Date`

#### Defined in

[SyncItem.ts:15](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L15)

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

[SyncItem.ts:43](https://github.com/ChrisVilches/Collection-Sync/blob/fde950f/src/SyncItem.ts#L43)
