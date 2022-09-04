var fs = require('fs');
var path = require('path');

var PROJECT_PATH = fs.realpathSync(__dirname + '/../');
var inited = false;
var Utils;

var init = function() {
    inited = true;
    process.chdir(PROJECT_PATH);
    Utils = require('./../lib/core/Utils');
};

var ensure_inited = function() {
    if (!inited) init();
};

task('validate_start', ['db:validate_cache', 'db:validate_db', 'validate_cdn_cache', 'validate_params', 'validate_paths'], function(params) {
    complete();
}, true);

var stop_env_processes = function(check) {
    var execSync = require('exec-sync');
    var lines = execSync("forever list");
    if (!lines)
        return;
    lines.split("\n").forEach(function(line) {
        if (line.match(new RegExp(check))) {
            var id = line.match(/\[([0-9]+)\]/);
            if (!id)
                return;
            execSync("forever stop " + id[1])
        }
    })
};

task('validate_paths', [], function() {
    ensure_inited();
    Utils.ensureDirSync(path.join(PROJECT_PATH, 'logs'));
});

task('validate_params', [], function(params) {
    if (!process.env['TARGET']) {
        throw new Error('Не указана соц. сеть (TARGET not found)');
    }
    complete();
}, true);

desc('Проверка существования папки для cdn кеша');
task('validate_cdn_cache', [], function(params) {
    ensure_inited();
    var app_config = require('./../lib/core/Config').app_config(path.join(process.cwd(), 'config'));
    Utils.ensureDirSync(path.join(process.cwd(), app_config.cdn_cache_dir));
    complete();
}, true);

desc("Запуск сервера и сервисов для отладки.\n     Возможные параметры: jake server[<log_format>,<map_file>,<keep_cache>]");
task('server', ['validate_start'], function(log_format, map_file, keep_cache) {
    ensure_inited();
    if (log_format && log_format.length <= 0)
        log_format = null;

    if (!keep_cache)
        jake.Task['db:flush_cache'].invoke();

    var spawn = require('child_process').spawn;

    var bunyan_program = path.normalize('node_modules/bunyan/bin/bunyan');

    // Проверить наличие bunyan иначе будет сложности с восприятием ошибки
    if (!fs.existsSync(bunyan_program)) {
        throw new Error('ERROR. bunyan not found on path ' + bunyan_program);
    }

    var io_params = {'stdio': ['pipe', 1, 2]};
    var run_params = [bunyan_program];

    // Распарсим строку с учетом кавычек.
    if (log_format) {
        var patt = /(?:^| )("(?:[^"]+)*"|'(?:[^']+)*'|[^ ]*)/g;

        log_format.split(patt).forEach(function(value) {
            if (value) run_params.push(value);
        });
    }
    var bunyan = spawn('node', run_params, io_params);
    bunyan.stdin.setEncoding('utf8');

    bunyan.on('exit', function(code) {
        console.log('bunyan DEATH', code);
    });

    bunyan.stdin.on('error', function(data) {
        console.log('--bunyan.stdin.on ERROR--');
    });
    bunyan.stdin.on('close', function(data) {
        console.log('--bunyan.stdin.on CLOSE--');
    });

    // Запускаем сервер
    io_params = {'stdio': [0, 'pipe', 'pipe']};
    var node_debug = path.normalize('node_modules/node-inspector/bin/node-debug.js');
    var proc_name = (process.env.NODE_DEBUG ? node_debug : 'node')
    var server = spawn(proc_name, map_file ? ['Server.js', 'MAP_FILE=' + map_file] : ['Server.js'], io_params);
    server.stdout.setEncoding('utf8');
    server.stderr.setEncoding('utf8');

    server.stdout.pipe(bunyan.stdin);
    server.stderr.pipe(bunyan.stdin);

    server.on('exit', function(code) {
        console.log('server DEATH', code);
        bunyan.kill();
        complete();
    });
}, true);

desc("Запуск сервера и сервисов для отладки.\n     Возможные параметры: jake server-prof[<log_format>,<map_file>,<keep_cache>]");
task('server-prof', [], function(log_format, map_file, keep_cache) {
    process.env.NODE_DEBUG = true;
    jake.Task['server'].invoke(log_format, map_file, keep_cache);
});

desc('Извлечение из логов записей по конкретным пользователям');
task('getlogs', [], function() {
    ensure_inited();
    if (arguments.length <= 0)
        return fail('enter user id');
    var ids = {};
    for (var i in arguments)
        ids[arguments[i]] = true;
    var existingIds = {};
    fs.readFileSync('./logs/server.master.log', 'utf8').split('\n').forEach(function(line) {
        var m = line.match(/^[^\[\]]*\[[^\[\]]*\][^\[\]]*\[([^\[\]]*)\]/);
        if (!m)
            return;
        existingIds[m[1]] = true;
        if (!(m[1] in ids))
            return;
        console.log(m.input)
    });
    console.log('users in logs :', Object.keys(existingIds));
    complete();
}, true);
