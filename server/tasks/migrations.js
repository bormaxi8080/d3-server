var fs = require('fs');
var path = require('path');
var taskUtils;
var Utils;

red = '\033[31m';
blue = '\033[34m';
green = '\x1b[32m';
reset = '\033[0m';

var ROOT_PATH = fs.realpathSync(__dirname + '/../../..');

var config;
var logger = null;
var logger_settings = {
    console_silent: false,
    console_level: 'warn',
    file_level: 'info',
    file_name: 'logs/map_migrate.log',
    file_max_size: 0,
    file_json: false,
    file_silent: true
};
var echoCmd = function(msg) {
    return "echo " + (!process.platform.match(/^win/) ? '"' + msg + '"': msg)
};

var migration_dir = false;
var migrations_scripts_dir = false;
var moment;
var execSync;

var init_requiries = function() {
    moment = require("moment");
    execSync = require('exec-sync');
    require('js-yaml');
    taskUtils = require('./utils.js');
    Utils = require('../lib/core/Utils');
    if (!logger) {
        Utils.ensureDirSync('logs');
        Logger = require('./../lib/core/Logger').Logger;
        logger = new Logger(logger_settings, null);
    }
}

var init = function() {
    init_requiries();
    process.chdir(path.normalize(__dirname + '/..'));
    config = require('./../lib/core/Config').app_config(path.join(process.cwd(), 'config'));
    migration_dir = config.world_migrations_dir;
    if (migration_dir == undefined || migration_dir == false)
        fail("world_migrations_dir not found in app.yml");

    migration_dir = path.join(process.cwd(), migration_dir);
    migrations_scripts_dir = path.join(process.cwd(), config.world_migrations_scripts_dir);

    if (!fs.existsSync(migration_dir)) {
        fail("Migrations path: " + migration_dir + " is not specified.");
    }

    if (!fs.existsSync(migrations_scripts_dir)) {
        fail("Migrations script path: " + migrations_scripts_dir + " is not specified.");
    }

}

var migrateTemplate = function(version, migration_name, script_version) {
    init_requiries();
    var s = "//Migration {{migration_name}}\n" +
        "var _{{version}} = function() {\n" +
        "    this.name = \"{{migration_name}}\";\n" +
        "    this.version = {{version}};\n" +
        "    this.script_version = \"{{script_version}}\";\n\n" +
        "    this.execute = function(world, rooms, context) {\n"+
        "    }\n" +
        "};\n"+
        "module.exports = new _{{version}}();\n";
    s = s.replace(/{{version}}/g, version)
         .replace(/{{migration_name}}/g, migration_name)
         .replace(/{{script_version}}/g, script_version);

    return s;
}

namespace('world_migrations', function () {
    desc("Создает миграцию для мира игрока (jake world_migrations:create[Migration name])");
    task("create", ["build"], function(migration_name) {
        init_requiries();

        if (!migration_name) {
            fail(red + "Migration name is not specified" + reset);
        }

        init();

        var date = new moment();
        var version = date.format("YYYYMMDDHHmmss");

        var migration_file = path.join(migration_dir, version + "-" + migration_name + ".js");
        var script_version = execSync('git rev-parse HEAD');
        var script_path = path.join(process.cwd(), config.batch_runner.base_js_dir, script_version + '.js');
        var migration_script_path = path.join(migrations_scripts_dir, script_version + '.js');

        if (!fs.existsSync(script_path)) {
            fail(red + "Migration script " + script_path + " not found. Run 'jake build'" + reset)
        }

        var bf = fs.readFileSync(script_path);
        fs.writeFileSync(migration_script_path, bf);

        var result = fs.writeFileSync(migration_file, migrateTemplate(version, migration_name, script_version));
        console.log(green + "Migration "+ migration_name+" created (store in "+ migration_file+")" + reset);
        complete();
    });
});
