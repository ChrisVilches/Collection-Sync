[collection-sync](../README.md) / [Exports](../modules.md) / IInitializable

# Interface: IInitializable

## Hierarchy

- **`IInitializable`**

  ↳ [`Collection`](Collection.md)

## Implemented by

- [`CollectionSyncMetadata`](../classes/CollectionSyncMetadata.md)

## Table of contents

### Methods

- [initialize](IInitializable.md#initialize)

## Methods

### initialize

▸ **initialize**(): `Promise`<`void`\>

Executes async logic to initialize collection or datastore (open file, create database connection, etc).

#### Returns

`Promise`<`void`\>

#### Defined in

[IInitializable.ts:3](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/IInitializable.ts#L3)
