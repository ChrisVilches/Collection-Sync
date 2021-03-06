# Other specifications

## Handling errors during sync

Specifications for how errors are handled during a sync operation.

|  | Conflict (all or none flag) | Conflict (sync until conflict flag) | Unexpected Error | No error |
| --- | --- | --- | --- | --- |
| Update last sync date<sup>1</sup> | No | Yes | No | Yes |
| Execute rollback<sup>2</sup> | No<sup>3</sup>  | No<sup>4</sup> | Yes<sup>5</sup> | No |
| Execute commit | No | Yes | No | Yes |
| Error type | Conflict | None | Unexpected | None |

Notes:

1. Another condition is that `commit` returns success.
2. Abortion is also executed whenever a lifecycle hook returns `false` (other than `cleanUp`).
3. Conflict is detected before sync is actually executed, so it's aborted prematurely, making rollback unnecessary.
4. Keep changes (partially synced data before conflict).
5. Rollback will have no effect if it's not implemented/supported by the user implementation.
