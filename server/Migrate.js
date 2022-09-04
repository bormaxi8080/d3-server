#!/usr/bin/env node

var moment    = require("moment");
var SequelizeSharded = require("./lib/core/data/SequelizeSharded");
var Config = require("./lib/core/Config");

const path      = require("path")
    , fs        = require("fs")
    , program   = require("commander")
    , Sequelize = require('sequelize')
    , _         = Sequelize.Utils._

var migrationsPath   = process.cwd() + '/migrations'
  , migrationsPathExists = fs.existsSync(migrationsPath)

var createMigrationsFolder = function(force) {
  if(force) {
    console.log('Deleting the migrations folder.')
    try {
      fs.readdirSync(migrationsPath).forEach(function(filename) {
        fs.unlinkSync(migrationsPath + '/' + filename)
      })
    } catch(e) {}
    try {
      fs.rmdirSync(migrationsPath)
      console.log('Successfully deleted the migrations folder.')
    } catch(e) {}
  }

  console.log('Creating migrations folder.')
  try {
    fs.mkdirSync(migrationsPath)
    console.log('Successfully create migrations folder.')
  } catch(e) {
    console.log('Migrations folder already exist.')
  }
}

program
  .option('-i, --init', 'Initializes the project. Creates a config/config.json')
  .option('-m, --migrate', 'Runs undone migrations')
  .option('-u, --undo', 'Redo the last migration.')
  .option('-f, --force', 'Forces the action to be done.')
  .option('-c, --create-migration [migration-name]', 'Create a new migration skeleton file.')
  .parse(process.argv)

var migrateNext = function(shard_names, shards) {
    var sh_name = shard_names.pop();

    var sequelize       = shards[sh_name]
      , migratorOptions = { path: migrationsPath }
      , migrator        = sequelize.getMigrator(migratorOptions)

    console.log('START mirgate for shard ' + sh_name);

    migrator.migrate()
    .success(function() {

        console.log('COMPLETE migrate for shard ' + sh_name);

        if (shard_names.length) {
            migrateNext(shard_names, shards);
        } else {
            console.log('--== Complete ==--');
        }
    })
    .error(function(error) {
        console.log('-- Error. ' + sh_name + ' ' + error);
    })
}

var downNext = function(shard_names, shards) {
    var sh_name = shard_names.pop();

    var sequelize       = shards[sh_name]
      , migratorOptions = { path: migrationsPath }
      , migrator        = sequelize.getMigrator(migratorOptions)

    console.log('START downgrade for shard ' + sh_name);

    sequelize.migrator.findOrCreateSequelizeMetaDAO()
    .success (function(Meta) {
        Meta.find ({ order: 'id DESC' })
        .success (function(meta) {
            if (meta) {
                migrator = sequelize.getMigrator(_.extend(migratorOptions, meta), true)
                migrator.migrate({ method: 'down' })
                .success(function() {
                    console.log('COMPLETE downgrade for shard ' + sh_name);

                    if (shard_names.length) {
                        downNext(shard_names, shards);
                    } else {
                        console.log('--== Complete ==--');
                        process.exit();
                    }
                })
                .error(function(error) {
                    console.log('-- ERROR. ' + sh_name + ' ' + error);
                })
            } else {
                console.log('-- No migrations for downgrade on shard ' + sh_name);

                if (shard_names.length) {
                    downNext(shard_names, shards);
                } else {
                    console.log('--== Complete ==--');
                }
            }
        })
    })
}

if (program.migrate) {
    var config = require("./config/Config");
    Config.load(config);
    var dbShards = new SequelizeSharded(Config.db());

    var shards = dbShards.shards;
    var shard_names = []
    for (var i in dbShards.shards) {
        shard_names.push(i);
    }

    if (program.undo) {
        downNext(shard_names, shards);
    } else {
        migrateNext(shard_names, shards);
    }

} else if (program.undo) {
    var config = require("./config/Config");
    Config.load(config);
    var dbShards = new SequelizeSharded(Config.db());

    var shards = dbShards.shards;
    var shard_names = []
    for (var i in dbShards.shards) {
        shard_names.push(i);
    }

    downNext(shard_names, shards);

} else if(program.init) {
    if (!program.force && migrationsPathExists) {
        console.log (migrationsPath + ' already exists. Run "' + program._name + ' --init --force" to overwrite it.')
    } else {
        createMigrationsFolder(program.force);
    }

} else if(program.createMigration) {
    if (!migrationsPathExists) {
        createMigrationsFolder();
    }

    var migrationName = [
        moment().format('YYYYMMDDHHmmss'),
        (typeof program.createMigration == 'string') ? program.createMigration : 'unnamed-migration'
    ].join('-') + '.js'

    var migrationContent = [
      "module.exports = {",
      "    up: function(migration, DataTypes) {",
      "        // add altering commands here",
      "    },",
      "    down: function(migration) {",
      "        // add reverting commands here",
      "    }",
      "}"
    ].join('\n')

    fs.writeFileSync(migrationsPath + '/' + migrationName, migrationContent)
} else {

console.log('Please define any params! --help for help.')
}
