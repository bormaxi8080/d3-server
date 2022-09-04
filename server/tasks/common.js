var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var taskUtils = require("./utils.js");
var Utils;
var execSync;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (!process.env['TARGET'])
    process.env['TARGET'] = 'VK';
if (!process.env['LOCALE'])
    process.env['LOCALE'] = 'RU';

var ROOT_PATH = fs.realpathSync(__dirname + '/../..');
var DEF_PATH = path.join(ROOT_PATH, 'js/defs');
var PROJECT_PATH = path.join(ROOT_PATH, '/server');
var TMP_PATH = path.join(PROJECT_PATH, '/tmp');
var BUILD_TMP_PATH = path.join(TMP_PATH, '/build');

require('./defs.js');
require('./support.js');
require('./run.js');
require('./db.js');
require('./sqdn.js');
require('./tests.js');
require('./migrations.js');

var init = function() {
    require('fibers');
    execSync = require('exec-sync');
    Utils = require('./../lib/core/Utils');
};

jake.addListener('complete', function() { process.exit(); });

task('default', ['deploy', 'server'], function(params) {
    complete();
}, true);

desc('Установка зависимостей');
task('depends', [], function (params)
{
    console.log("updating dependencies...");
    var cmd = 'npm install';

    exec(cmd, {cwd: __dirname}, function (error, stdout, stderr) {
        if (error) {
            console.log(cmd);
            console.log(stderr);
            return fail();
        }
        console.log(taskUtils.green + "core dependencies updated" + taskUtils.reset);
        exec(cmd, {cwd: PROJECT_PATH}, function (error, stdout, stderr) {
            if (error) {
                console.log(cmd);
                console.log(stderr);
                return fail();
            }

            console.log(taskUtils.green + "project dependencies updated" + taskUtils.reset);
            console.log(taskUtils.green + "update done" + taskUtils.reset);
            complete();
        });
    });
}, true);


desc('Тесты и миграции для запуска перед коммитом');
task('precommit', ['defs:migrate', 'defs:validate' ,'defs:sort_locale', 'build:compile_locale', 'test'], function (params) {
    console.log(taskUtils.green + "predeploy done" + taskUtils.reset);
}, true);

desc('Подготовка рабочего окружения');
task('deploy', ['depends', 'db:recreate', 'db:seed', 'build'], function (params) {
    console.log(taskUtils.green + "deploy done" + taskUtils.reset);
    complete();
}, true);

desc('Сборка клиента и сервера');
task('build', ['build:server'], function (params) {
    console.log(taskUtils.green + "build done" + taskUtils.reset);
    complete();
}, true);

namespace('build', function() {
    desc('Сборка файлов для сервера');
    task('server', ['build_version', 'prepare_products'], function() {
        console.log(taskUtils.green + "server build done" + taskUtils.reset);
        complete();
    }, true);

    task('build_version', ['combine_js_for_server'], function() {
        init();
        // Проверок не делаем, т.к. если будут проблемы, то все равно работать нельзя.
        var version = (taskUtils.isCi()) ? taskUtils.ciData[0] : execSync('git log -1 --pretty=format:%H');

        Utils.ensureDirSync(BUILD_TMP_PATH);

        var version_fname = path.join(TMP_PATH, 'version.txt');
        var logic_fname = path.join(TMP_PATH, version + ".js");

        var js_logic = fs.readFileSync(BUILD_TMP_PATH + "/serverContext.js");
        fs.writeFileSync(logic_fname, js_logic);
        fs.writeFileSync(version_fname, version);

        complete();
    }, true);

    task('prepare_products', ['build_version'], function() {
        var network_codes = ["appstore"];
        var config = {};
        var products_def = require(fs.realpathSync(path.join(ROOT_PATH, 'js/defs/products.json')));

        ["appstore"].forEach(function(net) {
            config[net] = {};

            for (var product_id in products_def) {
                var product = products_def[product_id]
                var store_data = product.store[net];
                config[net][store_data.id] = {
                    service_id: product_id,
                    title: product.presentation.name,
                    cost: store_data.cost,
                    inner_product_id: product_id
                };
            }
        });

        fs.writeFileSync(path.join(TMP_PATH, 'products.json'), JSON.stringify(config, null, 2));
        complete();
    }, true)

    desc('Подготовка Context.js для сервера.');
    task('combine_js_for_server', [], function() {
        init();
        console.log('combine_js_for_server..');

        Utils.ensureDirSync(BUILD_TMP_PATH);

        var settings = {
            defs_path: '/js/defs',
            js_paths: [
                '/js'
            ],
            exclude_js_files: [
                'js/defs/',
                'js/custom/',
                'js/logic.js',

                'js/createContext.js',
                'js/createDefinitions.js'
            ],
            result_file: "server/tmp/build/serverContext.js"
        };

        Utils.combine_context_js_for_server(ROOT_PATH, settings, true, true);

        var settings = {
            defs_path: '/js/defs',
            js_paths: [
                '/js'
            ],
            exclude_js_files: [
                'js/defs/',
                'js/test/',
                'js/custom/',
                'js/logic.js',
                'js/createContext.js'
            ],
            result_file: "static/assets/mobile/all.js",
            container: "/js/createContext.js",
            container_marker: "/* JS_TEST_INCLUDES_MARKER */",
            context_initialize: true
        };
        Utils.combine_context_js_for_server(ROOT_PATH, settings, true, false);

        console.log(taskUtils.green + "combine_js_for_server" + taskUtils.reset);
        complete();
    }, true);

});
