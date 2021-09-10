[collection-sync](../README.md) / [Exports](../modules.md) / SyncConflictStrategy

# Enumeration: SyncConflictStrategy

## Table of contents

### Enumeration members

- [Force](SyncConflictStrategy.md#force)
- [Ignore](SyncConflictStrategy.md#ignore)
- [RaiseError](SyncConflictStrategy.md#raiseerror)
- [SyncUntilConflict](SyncConflictStrategy.md#syncuntilconflict)

## Enumeration members

### Force

• **Force** = `"Force"`

Force synchronizing by using the data from the source collection.
Fetch will use the parent's data to update local data. Post will use
data from the local collection and force it
into the parent.

#### Defined in

[types/SyncTypes.ts:8](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/types/SyncTypes.ts#L8)

___

### Ignore

• **Ignore** = `"Ignore"`

Ignore conflicting items (do nothing about them).

#### Defined in

[types/SyncTypes.ts:14](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/types/SyncTypes.ts#L14)

___

### RaiseError

• **RaiseError** = `"RaiseError"`

Abort sync if there's a conflicting item in the item set to sync (i.e. sync all or none).

#### Defined in

[types/SyncTypes.ts:11](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/types/SyncTypes.ts#L11)

___

### SyncUntilConflict

• **SyncUntilConflict** = `"SyncUntilConflict"`

Syncs the items in order until there's a conflict.

#### Defined in

[types/SyncTypes.ts:17](https://github.com/ChrisVilches/Collection-Sync/blob/618707f/src/types/SyncTypes.ts#L17)
