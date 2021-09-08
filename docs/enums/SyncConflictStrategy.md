[collection-sync](../README.md) / [Exports](../modules.md) / SyncConflictStrategy

# Enumeration: SyncConflictStrategy

## Table of contents

### Enumeration members

- [Force](SyncConflictStrategy.md#force)
- [Ignore](SyncConflictStrategy.md#ignore)
- [RaiseError](SyncConflictStrategy.md#raiseerror)

## Enumeration members

### Force

• **Force** = `0`

Keep data from the side that initiated the sync.

#### Defined in

[types/SyncTypes.ts:3](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/types/SyncTypes.ts#L3)

___

### Ignore

• **Ignore** = `2`

In order to fix conflicts correctly, at least one
sync must not use ignore and throw error and select option.

#### Defined in

[types/SyncTypes.ts:12](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/types/SyncTypes.ts#L12)

___

### RaiseError

• **RaiseError** = `1`

Abort sync.

#### Defined in

[types/SyncTypes.ts:6](https://github.com/ChrisVilches/Collection-Sync/blob/1677b22/src/types/SyncTypes.ts#L6)
