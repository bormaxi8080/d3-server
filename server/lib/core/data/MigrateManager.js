/**
 * Модуль, предоставляющий API для
 * миграция над миром пользователя
 */

var MigrationUtils = require('../../utils/MigrationUtils');
var path = require('path');
var fs = require('fs');
var clone = require('node-v8-clone').clone;
var inspect = require('util').inspect;

var MigrateManager = function(config, core) {
    this.directory = config.directory;
    this.batchRunnerFactory = config.batchRunnerFactory;
    this._core = core;
    this._logger = config.logger;
}

MigrateManager.prototype.init = function() {
    if (!this.batchRunnerFactory) {
        throw new Error("batchRunnerFactory is not defined");
    }

    var files = this.getMigrationsFiles(this.directory);
    this.migrations = this.createMigrations(files);
    this.migrations.sort(function(first, second) {
        return (first.version - second.version);
    });

    if (this.migrations.length > 0) {
        this.last_version = this.migrations[this.migrations.length - 1].version;
    } else {
        this.last_version = 0;
    }

    return this;
}

MigrateManager.prototype.getMigrations = function() {
    return this.migrations;
}

MigrateManager.prototype.createMigrations = function(versions) {
    var _self = this
    return versions.map(function(el) {
        return _self.createMigration(path.join(_self.directory, el));
    });
}

MigrateManager.prototype.createMigration = function(path) {
    var instance = require(path);

    instance.clone = clone;
    instance.inspect = inspect;
    instance.utils = MigrationUtils;

    instance.setLogger = function(logger) {
        instance.logger = logger;
        if (logger.setMetadata) {
            logger.setMetadata(instance.name, instance.version)
        }
    };

    return instance;
};

MigrateManager.prototype.getMigrationsFiles = function(dir) {
    if (!fs.existsSync(dir))
        throw new Error("World Migrations directory not found");

    var files = fs.readdirSync(dir);

    return files.filter(function(el) {
        return (/^.+\.js$/.test(el));
    });
}

MigrateManager.prototype.getLastVersion = function() {
    return this.last_version;
}

MigrateManager.prototype.getMigrationIndexByVersion = function(version) {
    if (version === 0) {
        return 0;
    } else for (var i = 0; i < this.migrations.length; i++) {
        if (this.migrations[i].version == version) {
            return i + 1;
        }
    }

    return -1;
};

MigrateManager.prototype.execute = function(current_version, world, rooms, config, to_version, logger) {
    var logger = logger || this._logger;
    var social_id = world.player.social_id; //Сохраним инфу на случай, если миграция попортит данные пользователя
    var from_index = this.getMigrationIndexByVersion(current_version);
    if (from_index === -1) {
        logger.warn("Previous migration before " + current_version + " not found on user " + social_id);
        return false;
    }

    var to_index = 0;
    if (to_version) {
        to_index = this.getMigrationIndexByVersion(to_version) + 1;
    } else {
        to_index = this.migrations.length;
    }

    for (var i = from_index; i < to_index; ++i) {
        var context = null;
        var migration = this.migrations[i]
        if (migration.script_version) {
            var batch = this.batchRunnerFactory.get(migration.script_version);
            batch.context.setStorageDump({});
            if (batch.context.cache) {
                batch.context.cache.clear();
            }
            var context = batch.context;
        }

        migration.setLogger(logger);

        try {
            logger.info("Run migration version " + migration.version + " on user " + social_id);
            migration.execute(world, rooms, context);
        } catch(e) {
            logger.fatal("Migration version " + migration.version + " on user " + social_id + " failed");
            logger.fatal(e);
            return false;
        }
    }

    return true;
};

module.exports = MigrateManager;
