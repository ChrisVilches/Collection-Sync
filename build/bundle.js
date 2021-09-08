var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("types/DocId", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("CollectionItem", [], function (exports_2, context_2) {
    "use strict";
    var CollectionItem;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            CollectionItem = (function () {
                function CollectionItem(id, document, updatedAt) {
                    this._id = id;
                    this._document = document;
                    this._updatedAt = updatedAt;
                }
                Object.defineProperty(CollectionItem.prototype, "id", {
                    get: function () {
                        return this._id;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(CollectionItem.prototype, "updatedAt", {
                    get: function () {
                        return this._updatedAt;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(CollectionItem.prototype, "document", {
                    get: function () {
                        return this._document;
                    },
                    enumerable: false,
                    configurable: true
                });
                CollectionItem.prototype.update = function (document, updatedAt) {
                    this._document = document;
                    this._updatedAt = updatedAt;
                };
                return CollectionItem;
            }());
            exports_2("default", CollectionItem);
        }
    };
});
System.register("IInitializable", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Collection", [], function (exports_4, context_4) {
    "use strict";
    var Collection;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            Collection = (function () {
                function Collection() {
                }
                return Collection;
            }());
            exports_4("default", Collection);
        }
    };
});
System.register("types/SyncTypes", [], function (exports_5, context_5) {
    "use strict";
    var SyncConflictStrategy, SyncOperation;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            (function (SyncConflictStrategy) {
                SyncConflictStrategy[SyncConflictStrategy["Force"] = 0] = "Force";
                SyncConflictStrategy[SyncConflictStrategy["RaiseError"] = 1] = "RaiseError";
                SyncConflictStrategy[SyncConflictStrategy["Ignore"] = 2] = "Ignore";
            })(SyncConflictStrategy || (SyncConflictStrategy = {}));
            exports_5("SyncConflictStrategy", SyncConflictStrategy);
            (function (SyncOperation) {
                SyncOperation[SyncOperation["Fetch"] = 0] = "Fetch";
                SyncOperation[SyncOperation["Post"] = 1] = "Post";
            })(SyncOperation || (SyncOperation = {}));
            exports_5("SyncOperation", SyncOperation);
        }
    };
});
System.register("CollectionSyncMetadata", ["types/SyncTypes"], function (exports_6, context_6) {
    "use strict";
    var SyncTypes_1, CollectionSyncMetadata;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (SyncTypes_1_1) {
                SyncTypes_1 = SyncTypes_1_1;
            }
        ],
        execute: function () {
            CollectionSyncMetadata = (function () {
                function CollectionSyncMetadata() {
                }
                CollectionSyncMetadata.prototype.setLastAt = function (d, syncOperation) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(syncOperation == SyncTypes_1.SyncOperation.Fetch)) return [3, 2];
                                    return [4, this.setLastFetchAt(d)];
                                case 1: return [2, _a.sent()];
                                case 2: return [4, this.setLastPostAt(d)];
                                case 3: return [2, _a.sent()];
                            }
                        });
                    });
                };
                CollectionSyncMetadata.prototype.getLastAt = function (syncOperation) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(syncOperation == SyncTypes_1.SyncOperation.Fetch)) return [3, 2];
                                    return [4, this.getLastFetchAt()];
                                case 1: return [2, _a.sent()];
                                case 2: return [4, this.getLastPostAt()];
                                case 3: return [2, _a.sent()];
                            }
                        });
                    });
                };
                return CollectionSyncMetadata;
            }());
            exports_6("default", CollectionSyncMetadata);
        }
    };
});
System.register("exceptions/ParentNotSetError", [], function (exports_7, context_7) {
    "use strict";
    var ParentNotSetError;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            ParentNotSetError = (function (_super) {
                __extends(ParentNotSetError, _super);
                function ParentNotSetError(extraMessage) {
                    var _this = this;
                    var messages = [
                        "Operation cannot be executed because node has no parent defined",
                    ];
                    if (typeof extraMessage === 'string' && extraMessage.trim().length > 0) {
                        messages.push(extraMessage);
                    }
                    _this = _super.call(this, messages.join(": ")) || this;
                    Object.setPrototypeOf(_this, ParentNotSetError.prototype);
                    return _this;
                }
                return ParentNotSetError;
            }(Error));
            exports_7("default", ParentNotSetError);
        }
    };
});
System.register("exceptions/UpdateNewerItemError", [], function (exports_8, context_8) {
    "use strict";
    var UpdateNewerItemError;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [],
        execute: function () {
            UpdateNewerItemError = (function (_super) {
                __extends(UpdateNewerItemError, _super);
                function UpdateNewerItemError(id) {
                    var _this = _super.call(this, "Cannot update a newer item using an older item, document ID " + id) || this;
                    _this.id = id;
                    Object.setPrototypeOf(_this, UpdateNewerItemError.prototype);
                    return _this;
                }
                return UpdateNewerItemError;
            }(Error));
            exports_8("default", UpdateNewerItemError);
        }
    };
});
System.register("SynchronizableCollection", ["exceptions/ParentNotSetError", "types/SyncTypes", "exceptions/UpdateNewerItemError", "Collection"], function (exports_9, context_9) {
    "use strict";
    var ParentNotSetError_1, SyncTypes_2, UpdateNewerItemError_1, Collection_1, SynchronizableCollection;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (ParentNotSetError_1_1) {
                ParentNotSetError_1 = ParentNotSetError_1_1;
            },
            function (SyncTypes_2_1) {
                SyncTypes_2 = SyncTypes_2_1;
            },
            function (UpdateNewerItemError_1_1) {
                UpdateNewerItemError_1 = UpdateNewerItemError_1_1;
            },
            function (Collection_1_1) {
                Collection_1 = Collection_1_1;
            }
        ],
        execute: function () {
            SynchronizableCollection = (function (_super) {
                __extends(SynchronizableCollection, _super);
                function SynchronizableCollection(syncMetadata) {
                    var _this = _super.call(this) || this;
                    _this.defaultSyncOptions = {
                        conflictStrategy: SyncTypes_2.SyncConflictStrategy.RaiseError
                    };
                    _this.syncMetadata = syncMetadata;
                    return _this;
                }
                Object.defineProperty(SynchronizableCollection.prototype, "parent", {
                    get: function () {
                        return this._parent;
                    },
                    set: function (p) {
                        this._parent = p;
                    },
                    enumerable: false,
                    configurable: true
                });
                SynchronizableCollection.prototype.needsSync = function (syncOperation) {
                    return __awaiter(this, void 0, void 0, function () {
                        var latestUpdatedItem, lastAt;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!this._parent)
                                        return [2, false];
                                    return [4, (syncOperation == SyncTypes_2.SyncOperation.Post ? this.latestUpdatedItem() : this._parent.latestUpdatedItem())];
                                case 1:
                                    latestUpdatedItem = _a.sent();
                                    if (latestUpdatedItem == null)
                                        return [2, false];
                                    return [4, this.syncMetadata.getLastAt(syncOperation)];
                                case 2:
                                    lastAt = _a.sent();
                                    if (!lastAt)
                                        return [2, true];
                                    return [2, lastAt < latestUpdatedItem.updatedAt];
                            }
                        });
                    });
                };
                SynchronizableCollection.prototype.itemsToFetch = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var lastFetchAt;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this.syncMetadata.getLastAt(SyncTypes_2.SyncOperation.Fetch)];
                                case 1:
                                    lastFetchAt = _a.sent();
                                    return [2, this._parent.itemsNewerThan(lastFetchAt)];
                            }
                        });
                    });
                };
                SynchronizableCollection.prototype.itemsToPost = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var lastPostAt;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this.syncMetadata.getLastAt(SyncTypes_2.SyncOperation.Post)];
                                case 1:
                                    lastPostAt = _a.sent();
                                    return [4, this.itemsNewerThan(lastPostAt)];
                                case 2: return [2, _a.sent()];
                            }
                        });
                    });
                };
                SynchronizableCollection.prototype.itemsToSync = function (syncOperation) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!this._parent) {
                                        throw new ParentNotSetError_1.default("Cannot sync to parent");
                                    }
                                    return [4, this.needsSync(syncOperation)];
                                case 1:
                                    if (!(_a.sent())) {
                                        return [2, []];
                                    }
                                    switch (syncOperation) {
                                        case SyncTypes_2.SyncOperation.Fetch:
                                            return [2, this.itemsToFetch()];
                                        case SyncTypes_2.SyncOperation.Post:
                                            return [2, this.itemsToPost()];
                                    }
                                    return [2];
                            }
                        });
                    });
                };
                SynchronizableCollection.prototype.sync = function (syncOperation, options) {
                    if (options === void 0) { options = this.defaultSyncOptions; }
                    return __awaiter(this, void 0, void 0, function () {
                        var items;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!this.needsSync(syncOperation))
                                        return [2];
                                    return [4, this.itemsToSync(syncOperation)];
                                case 1:
                                    items = _a.sent();
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, , 4, 7]);
                                    return [4, this.syncItems(items, syncOperation, options)];
                                case 3:
                                    _a.sent();
                                    return [3, 7];
                                case 4:
                                    if (!this.lastSyncedItem) return [3, 6];
                                    return [4, this.syncMetadata.setLastAt(this.lastSyncedItem.updatedAt, syncOperation)];
                                case 5:
                                    _a.sent();
                                    _a.label = 6;
                                case 6: return [7];
                                case 7: return [2];
                            }
                        });
                    });
                };
                SynchronizableCollection.prototype.syncItems = function (items, syncOperation, options) {
                    return __awaiter(this, void 0, void 0, function () {
                        var i, item, found, parent_1, upsertObject, conflict, force;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.lastSyncedItem = undefined;
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < items.length)) return [3, 7];
                                    item = items[i];
                                    found = void 0;
                                    parent_1 = this.parent;
                                    if (!(syncOperation == SyncTypes_2.SyncOperation.Fetch)) return [3, 3];
                                    return [4, this.findById(item.id)];
                                case 2:
                                    found = _a.sent();
                                    return [3, 5];
                                case 3: return [4, parent_1.findById(item.id)];
                                case 4:
                                    found = _a.sent();
                                    _a.label = 5;
                                case 5:
                                    upsertObject = syncOperation == SyncTypes_2.SyncOperation.Fetch ? this : parent_1;
                                    conflict = found && found.updatedAt > item.updatedAt;
                                    force = options.conflictStrategy == SyncTypes_2.SyncConflictStrategy.Force;
                                    if (force || !conflict) {
                                        upsertObject.upsert(item);
                                    }
                                    else if (options.conflictStrategy == SyncTypes_2.SyncConflictStrategy.RaiseError) {
                                        throw new UpdateNewerItemError_1.default(item.id);
                                    }
                                    this.lastSyncedItem = item;
                                    _a.label = 6;
                                case 6:
                                    i++;
                                    return [3, 1];
                                case 7: return [2];
                            }
                        });
                    });
                };
                return SynchronizableCollection;
            }(Collection_1.default));
            exports_9("default", SynchronizableCollection);
        }
    };
});
System.register("example-implementations/BasicSyncMetadata", ["CollectionSyncMetadata"], function (exports_10, context_10) {
    "use strict";
    var CollectionSyncMetadata_1, BasicSyncMetadata;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (CollectionSyncMetadata_1_1) {
                CollectionSyncMetadata_1 = CollectionSyncMetadata_1_1;
            }
        ],
        execute: function () {
            BasicSyncMetadata = (function (_super) {
                __extends(BasicSyncMetadata, _super);
                function BasicSyncMetadata(lastFetchAt, lastPostAt) {
                    var _this = _super.call(this) || this;
                    _this._lastFetchAt = lastFetchAt;
                    _this._lastPostAt = lastPostAt;
                    return _this;
                }
                BasicSyncMetadata.prototype.initialize = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2];
                        });
                    });
                };
                BasicSyncMetadata.prototype.setLastFetchAt = function (d) {
                    this._lastFetchAt = d;
                };
                BasicSyncMetadata.prototype.setLastPostAt = function (d) {
                    this._lastPostAt = d;
                };
                BasicSyncMetadata.prototype.getLastFetchAt = function () {
                    return this._lastFetchAt;
                };
                BasicSyncMetadata.prototype.getLastPostAt = function () {
                    return this._lastPostAt;
                };
                return BasicSyncMetadata;
            }(CollectionSyncMetadata_1.default));
            exports_10("default", BasicSyncMetadata);
        }
    };
});
System.register("example-implementations/JsonFileSyncMetadata", ["CollectionSyncMetadata", "fs", "path"], function (exports_11, context_11) {
    "use strict";
    var CollectionSyncMetadata_2, fs_1, path_1, JsonFileSynMetadata;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (CollectionSyncMetadata_2_1) {
                CollectionSyncMetadata_2 = CollectionSyncMetadata_2_1;
            },
            function (fs_1_1) {
                fs_1 = fs_1_1;
            },
            function (path_1_1) {
                path_1 = path_1_1;
            }
        ],
        execute: function () {
            JsonFileSynMetadata = (function (_super) {
                __extends(JsonFileSynMetadata, _super);
                function JsonFileSynMetadata(fileFolderPath, lastFetchAt, lastPostAt) {
                    var _this = _super.call(this) || this;
                    _this._initialLastFetchAt = lastFetchAt;
                    _this._initialLastPostAt = lastPostAt;
                    var timeStamp = (new Date()).getTime();
                    var randomId = Math.ceil(Math.random() * 100000000);
                    _this._fileName = path_1.default.join(fileFolderPath, randomId + "_data_sync_" + timeStamp + ".json");
                    return _this;
                }
                JsonFileSynMetadata.prototype.initialize = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.setDatesToJsonFile({
                                lastFetchAt: this._initialLastFetchAt,
                                lastPostAt: this._initialLastPostAt
                            });
                            return [2];
                        });
                    });
                };
                JsonFileSynMetadata.prototype.setDatesToJsonFile = function (dates) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        fs_1.default.writeFile(_this._fileName, JSON.stringify(dates), 'utf8', function (err) {
                            if (err)
                                return reject(err);
                            resolve();
                        });
                    });
                };
                JsonFileSynMetadata.prototype.getDatesFromJsonFile = function () {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        fs_1.default.readFile(_this._fileName, 'utf8', function (err, data) {
                            if (err)
                                return reject(err);
                            var obj;
                            try {
                                obj = JSON.parse(data);
                            }
                            catch (_e) {
                                obj = {
                                    lastFetchAt: undefined,
                                    lastPostAt: undefined
                                };
                            }
                            resolve({
                                lastFetchAt: !obj.lastFetchAt ? undefined : new Date(obj.lastFetchAt),
                                lastPostAt: !obj.lastPostAt ? undefined : new Date(obj.lastPostAt),
                            });
                        });
                    });
                };
                JsonFileSynMetadata.prototype.setLastFetchAt = function (d) {
                    return __awaiter(this, void 0, void 0, function () {
                        var datesObj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this.getDatesFromJsonFile()];
                                case 1:
                                    datesObj = _a.sent();
                                    datesObj.lastFetchAt = d;
                                    return [4, this.setDatesToJsonFile(datesObj)];
                                case 2:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                };
                JsonFileSynMetadata.prototype.setLastPostAt = function (d) {
                    return __awaiter(this, void 0, void 0, function () {
                        var datesObj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this.getDatesFromJsonFile()];
                                case 1:
                                    datesObj = _a.sent();
                                    datesObj.lastPostAt = d;
                                    return [4, this.setDatesToJsonFile(datesObj)];
                                case 2:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                };
                JsonFileSynMetadata.prototype.getLastFetchAt = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var datesObj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this.getDatesFromJsonFile()];
                                case 1:
                                    datesObj = _a.sent();
                                    return [2, datesObj.lastFetchAt];
                            }
                        });
                    });
                };
                JsonFileSynMetadata.prototype.getLastPostAt = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var datesObj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this.getDatesFromJsonFile()];
                                case 1:
                                    datesObj = _a.sent();
                                    return [2, datesObj.lastPostAt];
                            }
                        });
                    });
                };
                return JsonFileSynMetadata;
            }(CollectionSyncMetadata_2.default));
            exports_11("default", JsonFileSynMetadata);
        }
    };
});
System.register("example-implementations/PersonItem", ["CollectionItem"], function (exports_12, context_12) {
    "use strict";
    var CollectionItem_1, PersonItem;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (CollectionItem_1_1) {
                CollectionItem_1 = CollectionItem_1_1;
            }
        ],
        execute: function () {
            PersonItem = (function (_super) {
                __extends(PersonItem, _super);
                function PersonItem(id, person, updatedAt) {
                    return _super.call(this, id, person, updatedAt) || this;
                }
                return PersonItem;
            }(CollectionItem_1.default));
            exports_12("default", PersonItem);
        }
    };
});
System.register("example-implementations/SynchronizableArray", ["SynchronizableCollection", "example-implementations/BasicSyncMetadata"], function (exports_13, context_13) {
    "use strict";
    var SynchronizableCollection_1, BasicSyncMetadata_1, SynchronizableArray;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (SynchronizableCollection_1_1) {
                SynchronizableCollection_1 = SynchronizableCollection_1_1;
            },
            function (BasicSyncMetadata_1_1) {
                BasicSyncMetadata_1 = BasicSyncMetadata_1_1;
            }
        ],
        execute: function () {
            SynchronizableArray = (function (_super) {
                __extends(SynchronizableArray, _super);
                function SynchronizableArray(syncMetadata) {
                    if (syncMetadata === void 0) { syncMetadata = new BasicSyncMetadata_1.default(); }
                    var _this = _super.call(this, syncMetadata) || this;
                    _this.array = [];
                    return _this;
                }
                SynchronizableArray.prototype.initialize = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2];
                        });
                    });
                };
                SynchronizableArray.prototype.countAll = function () {
                    return this.array.length;
                };
                SynchronizableArray.prototype.itemsNewerThan = function (date) {
                    if (!date) {
                        return this.array;
                    }
                    return this.array.sort(function (a, b) { return a.updatedAt - b.updatedAt; })
                        .filter(function (item) { return date < item.updatedAt; });
                };
                SynchronizableArray.prototype.findById = function (id) {
                    return this.array.find(function (x) { return x.id == id; });
                };
                SynchronizableArray.prototype.upsert = function (item) {
                    var found = this.findById(item.id);
                    if (found) {
                        found.update(item.document, item.updatedAt);
                        return found;
                    }
                    else {
                        this.array.push(item);
                        return item;
                    }
                };
                SynchronizableArray.prototype.latestUpdatedItem = function () {
                    if (this.array.length == 0)
                        return undefined;
                    var latest = this.array[0];
                    for (var i = 0; i < this.array.length; i++) {
                        var curr = this.array[i];
                        if (latest.updatedAt < curr.updatedAt) {
                            latest = curr;
                        }
                    }
                    return latest;
                };
                return SynchronizableArray;
            }(SynchronizableCollection_1.default));
            exports_13("default", SynchronizableArray);
        }
    };
});
System.register("example-implementations/SynchronizableNeDB", ["example-implementations/PersonItem", "SynchronizableCollection", "example-implementations/BasicSyncMetadata", "nedb"], function (exports_14, context_14) {
    "use strict";
    var PersonItem_1, SynchronizableCollection_2, BasicSyncMetadata_2, nedb_1, ID_ATTRIBUTE_NAME, SynchronizableNeDB;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (PersonItem_1_1) {
                PersonItem_1 = PersonItem_1_1;
            },
            function (SynchronizableCollection_2_1) {
                SynchronizableCollection_2 = SynchronizableCollection_2_1;
            },
            function (BasicSyncMetadata_2_1) {
                BasicSyncMetadata_2 = BasicSyncMetadata_2_1;
            },
            function (nedb_1_1) {
                nedb_1 = nedb_1_1;
            }
        ],
        execute: function () {
            ID_ATTRIBUTE_NAME = "documentId";
            SynchronizableNeDB = (function (_super) {
                __extends(SynchronizableNeDB, _super);
                function SynchronizableNeDB(syncMetadata) {
                    if (syncMetadata === void 0) { syncMetadata = new BasicSyncMetadata_2.default(); }
                    return _super.call(this, syncMetadata) || this;
                }
                SynchronizableNeDB.prototype.initialize = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.db = new nedb_1.default({ timestampData: false });
                            return [2];
                        });
                    });
                };
                SynchronizableNeDB.prototype.makeItem = function (doc) {
                    if (!doc)
                        return undefined;
                    return new PersonItem_1.default(doc[ID_ATTRIBUTE_NAME], doc, doc.updatedAt);
                };
                SynchronizableNeDB.prototype.countAll = function () {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var _a;
                        (_a = _this.db) === null || _a === void 0 ? void 0 : _a.count({}, function (err, count) {
                            if (err)
                                return reject(err);
                            resolve(count);
                        });
                    });
                };
                SynchronizableNeDB.prototype.itemsNewerThan = function (date) {
                    var _this = this;
                    var where = !date ? {} : { updatedAt: { $gt: date } };
                    return new Promise(function (resolve, reject) {
                        var _a;
                        (_a = _this.db) === null || _a === void 0 ? void 0 : _a.find(where).sort({ updatedAt: 1 }).exec(function (err, docs) {
                            if (err)
                                return reject(err);
                            docs = docs.map(_this.makeItem);
                            resolve(docs);
                        });
                    });
                };
                SynchronizableNeDB.prototype.findById = function (id) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var _a;
                        var _b;
                        (_b = _this.db) === null || _b === void 0 ? void 0 : _b.findOne((_a = {}, _a[ID_ATTRIBUTE_NAME] = id, _a), function (err, doc) {
                            if (err)
                                return reject(err);
                            doc = _this.makeItem(doc);
                            resolve(doc);
                        });
                    });
                };
                SynchronizableNeDB.prototype.upsert = function (item) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var _a;
                        var _b;
                        item.document[ID_ATTRIBUTE_NAME] = item.id;
                        item.document.updatedAt = item.updatedAt;
                        delete item.document._id;
                        (_b = _this.db) === null || _b === void 0 ? void 0 : _b.update((_a = {}, _a[ID_ATTRIBUTE_NAME] = item.id, _a), item.document, { upsert: true }, function (err, _numReplaced, _upsert) {
                            if (err)
                                return reject(err);
                            resolve(item);
                        });
                    });
                };
                SynchronizableNeDB.prototype.latestUpdatedItem = function () {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var _a;
                        (_a = _this.db) === null || _a === void 0 ? void 0 : _a.find({}).sort({ updatedAt: -1 }).limit(1).exec(function (err, docs) {
                            if (err)
                                return reject(err);
                            resolve(_this.makeItem(docs[0]));
                        });
                    });
                };
                return SynchronizableNeDB;
            }(SynchronizableCollection_2.default));
            exports_14("default", SynchronizableNeDB);
        }
    };
});
//# sourceMappingURL=bundle.js.map