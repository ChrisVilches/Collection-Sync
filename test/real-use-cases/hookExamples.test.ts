/**
 * In order to test hooks, create a class (that extends an already made collection),
 * then do something simple like "before executing, copy the items to sync to a local object",
 * (items to sync are in the Synchronizer object, and "local" means SynchronizableCollection object),
 * that's enough to do something with the items.
 */

describe("pre execute hook", () => {
  xtest("before synchronizing, do something with with the items to sync", () => {

  });

  xtest("before synchronizing, check that items haven't been pushed yet to the database", () => {
    // TODO: May need to implement populating upsertedItems in the Synchronizer class (if it's not already implemented).
  });
});

describe("pre commit hook", () => {
  xtest("before committing, check that items were pushed to the destination collection", () => {
    // TODO: May need to implement populating upsertedItems in the Synchronizer class (if it's not already implemented).
  });
});

describe("rollback", () => {
  xtest("before synchronizing, do something with with the items to sync, then another thing when rollbacking", () => {

  });
});
