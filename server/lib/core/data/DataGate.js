
var Memory = require("./Memory");
var EventEmitterExt = require("../EventEmitterExt");
var Sequelize = require("./SequelizeSharded.js");
var MigrateManager = require("./MigrateManager");
var RequestCounter = require("./RequestCounter");
var path = require("path");

var DataGate = function(core) {
    this.core = core;
    if (!core.queryFactory) throw new Error("Не инициаллизировано свойство queryFactory!");
    if (!core.modelFactory) throw new Error("Не инициаллизировано свойство modelFactory!");

    this.connection = new Sequelize(core.config().db(), core.logger);
    var _memory = new Memory(core.config().cache(), core.logger);
    var _models = core.modelFactory.getModels(this.connection);

    this.request_counter = new RequestCounter();
    this.not_accept_requests = false;

    this.queryFactory = core.queryFactory;
    this.queryFactory.init(_models, _memory);
};

DataGate.prototype.initMigrateManager = function() {
    this.migration = new MigrateManager({
        "directory": path.join(process.cwd(), this.core.config().app().world_migrations_dir),
        "batchRunnerFactory": this.core.batchRunnerMigrationFactory,
        "logger": this.core.migration_logger
    }, this.core).init();
}

var Connection = function(shard, ts){
    this.shard = shard;
    this.ts = ts;
    this.id = ts.id;
};
Connection.prototype.commit = function(){
    var self = this;
    return new EventEmitterExt(function(emitter){
        self.ts.commit(function(ts, err){
            if (err)
                return emitter.emit("error", err);
            else
                return emitter.emit("success", true);
        });
    }).run();
};
Connection.prototype.rollback = function(){
    var self = this;
    return new EventEmitterExt(function(emitter){
        self.ts.rollback(function(ts, err){
            if (err)
                return emitter.emit("error", err);
            else
                return emitter.emit("success", true);
        });
    }).run();
};

DataGate.prototype.begin = function(shard_id) {
    var self = this;
    return new EventEmitterExt(function(emitter){
        self.connection.transaction(shard_id, function(ts, err) {
            if (!err && ts) {
                var conn = new Connection(shard_id, ts);
                emitter.emit("success", conn);
            }
            else
                emitter.emit('error', err);
        })
    }).run();
};

DataGate.prototype.getQuery = function(type) {
    return this.queryFactory.getQuery(type);
};

DataGate.prototype.hasQuery = function(type) {
    return this.queryFactory.getQuery(type);
};

DataGate.prototype.getQueryChainer = function(shard) {
    return new Sequelize.Utils.QueryChainer();
};

DataGate.prototype.getShardFor = function(social_id) {
    return this.connection.getShardFor(social_id);
};

module.exports = DataGate;