// Sequelize sharded
//
// Usage:
//
// var Sequelize = require("path_to_sequilize_sharded/sequelize_sharded");
//
// var cfg = {
//     'db': {
//         'common': {
//             'dialect': 'postgres',
//             'host': '127.0.0.1',
//             'port': '5432',
//             'username': 'postgres',
//             'password': ''
//         }
//     },
//     'shard_name_calc': function(id) {
//         return id;
//     },
//     'shards': {
//         'base': {
//             'db': 'db_shard_0',
//             'db_cfg': 'common'
//         },
//         'shard_0': {
//             'db': 'db_shard_0',
//             'db_cfg': 'common'
//         },
//         'shard_1': {
//             'db': 'db_shard_1',
//             'db_cfg': 'common'
//         }
//     }
// };
//
// var sequelize = new Sequelize(cfg);
//
// Standard sequilize model declaration
// var Project = sequelize.define('Project', {
//     title: Sequelize.STRING,
//     description: Sequelize.TEXT
// });
//
// Project.using('shard_0').create({title: 'proj1', description: 'descr1'}).success(function(project) { });;
// Project.using('shard_0').find({ where: {'title': 'proj1'}}).success(function(finded) { });

var JSONUtils = require("../../data/JSONUtils");

var adler32 = function(data)
{
    var base = 4096;
    var chunk = 1024;

    var len = data.length;
    var sum = 1;
    var int1 = sum & 0xFFFF;
    var int2 = sum >> 16;
    var i=-1;
    while(len > 0)
    {
        var n = chunk>len? len: chunk;
        len -= n;
        while(n-- >= 0)
        {
            int1 = int1 + data.charCodeAt(i++) & 0xFF;
            int2 = int2 + int1;
        }
        int1 %= base;
        int2 %= base;
    }
    return int1 << 16 | int2;
};

var Sequelize = require("sequelize"),
    util = require('util');

var _logger = null;
var SequelizeShardedLogger = function(shard) {
    this.log = function (s) {
        if (_logger && _logger.info)
            _logger.info("\x1b[32m[" + shard + "]\x1b[0m " + s);
        else
            console.log("\x1b[32m[" + shard + "]\x1b[0m " + s);
    };
};

module.exports = (function() {
    var SequelizeSharded = function(config, logger) {
        this.shards = {};

        _logger = logger;

        var base_shard = '';

        var cfg_db = config['db'];
        var cfg_shards = config['shards'];
        var cfg_extra = config['extra'];

        this.shards_cnt = 0;

        this.shard_name_calc = config['shard_name_calc'];

        var params;
        for (var shard_id in cfg_shards) {
            if (base_shard == '' || shard_id == 'base') {
                base_shard = shard_id;
            }

            params = JSONUtils.clone(cfg_db[cfg_shards[shard_id]['db_cfg']]['params']);

            if (config['logging'] !== false) {
                var logger = new SequelizeShardedLogger(shard_id);
                params.logging = logger.log;
            }
            else {
                params.logging = false;
            }

            this.shards[shard_id] = new Sequelize(
                cfg_shards[shard_id]['db'],
                cfg_db[cfg_shards[shard_id]['db_cfg']]['username'],
                cfg_db[cfg_shards[shard_id]['db_cfg']]['password'],
                params
            );

            this.shards_cnt++;
        }
        if (base_shard == 'base')
            this.shards_cnt--;

        params = JSONUtils.clone(cfg_db[cfg_shards[shard_id]['db_cfg']]['params']);

        if (config['logging'] !== false) {
            params.logging = logger.log;
        }
        else {
            params.logging = false;
        }

        var base_arguments = [
            cfg_shards[base_shard]['db'],
            cfg_db[cfg_shards[base_shard]['db_cfg']]['username'],
            cfg_db[cfg_shards[base_shard]['db_cfg']]['password'],
            params
        ];

        SequelizeSharded.super_.apply(this, base_arguments);

        for (var extra_id in cfg_extra) {
            var extra_logger = new SequelizeShardedLogger(extra_id);

            var extra_params = JSON.parse(JSON.stringify(cfg_db[cfg_extra[extra_id]['db_cfg']]['params']));
            extra_params.logging = extra_logger.log;
            this.shards[extra_id] = new Sequelize(
                cfg_extra[extra_id]['db'],
                cfg_db[cfg_extra[extra_id]['db_cfg']]['username'],
                cfg_db[cfg_extra[extra_id]['db_cfg']]['password'],
                extra_params
            );
        }
    };

    util.inherits(SequelizeSharded, Sequelize);

    for (var prop in Sequelize) {
        SequelizeSharded[prop] = Sequelize[prop];
    }

    SequelizeSharded.prototype.getShardFor = function(id) {
        if (this.shard_name_calc) {
            return this.shard_name_calc(id, this.shards_cnt);
        }
        return 'shard_' + (adler32(id.toString()) % this.shards_cnt).toString();
    };

    SequelizeSharded.prototype.transaction = function(shard_id, callback){
        var ts = new Sequelize.Utils.Transaction(this.shards[shard_id]);
        var client = ts.begin(function(ts, err){callback(ts, err)})
    };

    SequelizeSharded.prototype.define = function() {
        var defined = SequelizeSharded.super_.prototype.define.apply(this, arguments);

        defined.shards = {};

        for (var shard_id in this.shards) {
            var daoName = arguments[0] || '',
                attributes = arguments[1] || {},
                options = arguments[2] || {};

            defined.shards[shard_id] = this.shards[shard_id].define(daoName, attributes, options);
        }

        defined.using = function(id) {
            return this.shards[this.daoFactoryManager.sequelize.getShardFor(id)];
        };

        defined.using_shard = function(id) {
            return this.shards[id];
        };

        defined.parentHasOne = defined.hasOne;
        defined.parentBelongsTo = defined.belongsTo;
        defined.parentHasMany = defined.hasMany;

        defined.hasOne = function(associatedDAO, options) {
            this.parentHasOne(associatedDAO, options);

            for (var shard_id in this.shards) {
                this.shards[shard_id].hasOne(associatedDAO.using(shard_id), options);
            }

            return this;
        };

        defined.belongsTo = function(associatedDAO, options) {
            this.parentBelongsTo(associatedDAO, options);

            for (var shard_id in this.shards) {
                this.shards[shard_id].belongsTo(associatedDAO.using(shard_id), options);
            }

            return this;
        };

        defined.hasMany = function(associatedDAO, options) {
            this.parentHasMany(associatedDAO, options);

            for (var shard_id in this.shards) {
                this.shards[shard_id].hasMany(associatedDAO.using(shard_id), options);
            }

            return this;
        };

        return defined;
    };

    return SequelizeSharded;
})();