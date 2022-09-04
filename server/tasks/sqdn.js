var crypto  = require('crypto');
var path    = require('path');
var fs      = require('fs');
var http    = require('http');
var util    = require('util');

// Спрячем в init для того, чтобы небыло проблем с зависимостями.
var _;
var yaml;
var restler;
var glob;
var zip;
var Fiber;
var Future;
var logger;

var logger_settings = {
    console_silent: false,
    console_json: false,
    console_level: 'debug',
    file_level: 'debug',
    file_name: 'logs/sqdn.log',
    file_max_size: 0,
    file_json: false
};

var cfg, client_root, config_path;
var init = function () {
    _       = require('underscore');
    yaml    = require('js-yaml');
    restler = require('restler');
    glob    = require('glob');
    zip     = require('node-native-zip');
    Fiber  = require('fibers');
    Future = require('fibers/future');

    var root_path = path.normalize(path.join(__dirname, '/../'));
    process.chdir(root_path);

    if (!logger) {
        Logger = require('./../lib/core/Logger').Logger;
        logger = new Logger(logger_settings, null);
    }

    config_path = path.join(root_path, 'config');
    cfg = require('./../lib/core/Config').app_config(config_path);
    if (cfg.static_dir[cfg.static_dir.length - 1] == '/') {
        cfg.static_dir = cfg.static_dir.slice(0, -1);
    }

    client_root = cfg.static_dir;
};

var SQDN_SERVER = 'http://api.cdn.sqtools.ru';
var SQDN_UPLOAD_PATH = "/upload";
var SQDN_GET_VERSION_PATH = "/get_version";
var SQDN_GET_PROJECT_NAME = "/get_project_name";
var SQDN_GET_ATTACH = "/get_attach";
var SQDN_ASSETS_ALLOWED_EXTENSIONS = [
    'png', 'jpg', 'swf',
    'mp3', 'ttf', 'TTF',
    'scl', 'nqs', 'nqsv',
    'nqsm', 'nqsm2', 'js',
    'gif', 'gz', 'txt',
    'csv', 'xml', 'alp',
    'zip', 'pvr', 'gfx',
    'ogg', 'tga'
];

var MAX_RETRY = 2;       // Кол-во попыток получить ответ на запрос в случае 502 ошибке
var REQUEST_DELAY = 500; // задержки м/ду попытками при 502 milliseconds

namespace('sqdn', function() {
    desc('Сборка логики для заливки в CDN')
    task('compile_logic', [], function() {
        init();
        logger.info("BUILDING LOGIC FOR CDN FROM FOLDER: " + process.cwd());
        var Utils = require('./../lib/core/Utils');
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
            result_file: "static/all.js",
            container: "/js/createContext.js",
            container_marker: "/* JS_TEST_INCLUDES_MARKER */",
            context_initialize: true
        };
        Utils.combine_context_js_for_server("..", settings, true, false);
    });

    desc('Обновление логики + ассетов и загрузка на сервер sqdn (jake sqdn:update или jake sqdn:update[alpha|beta|production|development] )');
    task('update', ['compile_logic'], function(server) {
        init();
        logger.info('Updating logic && assets from local folder only');
        process_files(server, { upload_logic: true, upload_assets: true });
    }, { printStderr: true, printStdout: true, breakOnError: true, async: true });

    desc('Обновление и загрузка только ассетов на сервер sqdn (jake sqdn:update_assets или jake sqdn:update_assets[alpha|beta|production|development] )');
    task('update_assets', function(server) {
        init();
        logger.info('Updating assets only');
        process_files(server, { upload_assets: true });
    }, { printStderr: true, printStdout: true, breakOnError: true, async: true });

    desc('Обновление и загрузка только логики на сервер sqdn');
    task('update_logic', ['compile_logic'], function() {
        init();
        logger.info('Updating logic only');
        upload_files({ upload_logic: true });
    }, { printStderr: true, printStdout: true, breakOnError: true, async: true });

    desc('Обновление и загрузка только логики на сервер sqdn');
    task('upload', ['compile_logic'], function() {
        init();
        logger.info('Uploads assets && logic from scratch');
        upload_files({ upload_logic: true, upload_assets: true, append_assets: false });
    }, { printStderr: true, printStdout: true, breakOnError: true, async: true });
});

var process_files = function(server, upload_params) {
    if (!server) {
        upload_files(upload_params);
    } else {
        update_assets_from_server(server, function() {
            upload_files(upload_params);
        });
    }
};

var update_assets_from_server = function(server, callback) {
    var server_config = yaml.load(fs.readFileSync(path.join(config_path, server, 'app.yml'), 'utf8'));
    var manifest_url = server_config.manifest_url;
    var assets_local_filename = 'assets.json';

    restler.get(manifest_url).on('complete', function(manifest_data, res) {
        logger.info('Got manifest from [' + manifest_url + ']');

        var manifest = JSON.parse(manifest_data);

        var version = manifest['assets.json'].version;
        var assets_filename = 'assets.' + version + '.json';
        var assets_url = cfg.cdn_root_url + assets_filename;

        var assets_path = path.join(client_root, 'assets.json');
        restler.get(assets_url).on('complete', function(assets_data, res) {
            logger.info('Got assets.json from [' + assets_url + ']');

            fs.writeFileSync(assets_path, JSON.stringify(assets_data));

            callback();
        });
    });
};

var upload_files = function(options) {
    var ret, as_ret, js_ret;
    var prepared_json = {};
    var user = get_user();

    options = _.defaults(options || {}, {
        upload_logic: false,
        upload_assets: false,
        append_assets: true
    });

    Fiber(function() {
        logger.info ('-- START -- upload_files');

        if (options.upload_assets) {
            files_list().forEach(function(file) {
                ret = upload_file(user, file);
                if (ret.error) {
                    throw new Error("Critical error on uploading SQDN files");
                } else {
                    if (!(ret.path in prepared_json)) {
                        prepared_json[ret.path] = {};
                    }
                    prepared_json[ret.path][ret.file] = { version: ret.version, size: ret.size };
                }
            });

            update_manifests(prepared_json);

            var manifest_path = client_root + '/assets.json';
            combine_files_manifest(manifest_path, options.append_assets);
            as_ret = upload_file(user, manifest_path);
        }

        if (options.upload_logic) {
            var all_js_path = client_root + '/all.js';
            js_ret = upload_file(user, all_js_path);
        }

        if (options.upload_logic || options.upload_assets) {
            var manifest_json = {};

            if (options.upload_assets) {
                if (as_ret.version) {
                    manifest_json['assets.json'] = { version: as_ret.version, size: as_ret.size };
                } else {
                    console.log('ERROR. assets.json version is %s', as_ret.version);
                }
            }

            if (options.upload_logic) {
                if (js_ret.version) {
                    manifest_json['all.js'] = { version: js_ret.version, size: js_ret.size };
                } else {
                    console.log('ERROR. all.js version is %s', js_ret.version);
                }
            }

            update_main_manifest(manifest_json);
        } else {
            console.log('ERROR. Nothing specified for uploading.');
        }

        logger.info ('-- END -- upload_files');
    }).run();
};

var create_sig = function(params, user) {
    var ingnore_keys = ['sig', 'action', 'controller', 'user_id', 'filedata', 'attachdata'];
    var chunks = Object.keys(params).sort().map(function(key) {
        return (ingnore_keys.indexOf(key) >= 0 ? '' : key + '=' + params[key]);
    });

    var str = user['user_id'] + chunks.join('') + user['secret_key'];
    return crypto.createHash('md5').update(str).digest("hex");;
};

var create_signed_params = function(params, user) {
    params.sig = create_sig(params, user);
    return params;
};

var combine_files_manifest = function(assets_path, should_append) {
    var json_combined = {};

    if (should_append && fs.existsSync(assets_path)) {
        json_combined = JSON.parse(fs.readFileSync(assets_path, 'utf-8'));
    }

    glob.sync(path.join(client_root, '**', 'files.json')).forEach(function(file) {
        var p = file.replace(client_root + '/', '').split("/").slice(1, -1);
        var body = JSON.parse(fs.readFileSync(path.join(client_root, file), 'utf8'));
        for (var name in body) {
            var pth = path.join(p.join('/'), name);
            json_combined[pth] = body[name];
        }
    });

    fs.writeFileSync(assets_path, JSON.stringify(json_combined, null, 2), 'utf8')
};

var files_list = function() {
    var pattern = path.join(client_root, 'assets', '**', '*.{' + SQDN_ASSETS_ALLOWED_EXTENSIONS.join(',') + '}');
    return glob.sync(pattern).sort();
};

var get_user = function() {
    var user;
    try {
        var taskUtils = require('./utils.js');
        if (taskUtils.isCi()){
            user = taskUtils.getUserCI();
        } else {
            user = yaml.load(fs.readFileSync(config_path + '/secret.yml', 'utf8'));
            console.log("USER = ",user);
        }
    } catch (e) {
        console.log(e);
        throw new Error("ERROR. On loading secret.yml");
    }
    return user;
};

var upload_file = function(user, asset_path) {

    var unlink = function(file) {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            logger.warn('    Can\'t remove:' + file + '\n' + err);
        }
    };

    var api_sqdn_get = function(sqdn_api, options) {
        var future = new Future();
        restler.get(SQDN_SERVER + sqdn_api, options).on('complete', function(data, response) {
            future.return({code: response.statusCode, data: data});
        });
        return future;
    };

    var api_sqdn_post = function(sqdn_api, options) {
        var future = new Future();
        restler.post(SQDN_SERVER + sqdn_api, options).on('complete', function(data, response) {
            future.return({code: response.statusCode, data: data});
        });
        return future;
    };

    var assert_error = function(res) {
        if ( (res.code == 502) ||
             (typeof(res.data) == 'string') ||
             ('error' in res.data) ||
             (!('success' in res.data))) {
            console.log("ERROR:")
            console.log("RESPONSE:", res)
            return {path: null, file: null, version: null, error: true};
        } else {
            return false;
        }
    }

    if (!fs.existsSync(asset_path)) {
        logger.error('  ERROR. File not found. Skiping file ' + asset_path);
        return {path: null, file: null, version: null, error: false};
    }
    if (!fs.lstatSync(asset_path).isFile()) {
        logger.error('  ERROR. It is not a file. Skiping ' + asset_path);
        return {path: null, file: null, version: null, error: false};
    }

    var filename = asset_path.replace(client_root + "/", "");
    var extension = path.extname(filename);

    var current_path = path.dirname(asset_path);
    var current_file = path.basename(asset_path);

    var asset_content = fs.readFileSync(asset_path);
    var asset_size = asset_content.length;
    var hash = crypto.createHash('md5').update(asset_content).digest("hex");

    logger.info('Processing file ' + asset_path);
    var params = create_signed_params({
        filename: filename,
        user_id: user.user_id,
        project_id: user.project_id,
        hash: hash
    }, user);

    var options = { data: params };
    var res = try_call(3, function() {
        return api_sqdn_get(SQDN_GET_VERSION_PATH, options).wait();
    });

    var error = assert_error(res);
    if (error) return error;

    var version = res.data['success']['version'];
    if (version == 'new') {

        var params = create_signed_params({
            filename:     filename,
            user_id:      user.user_id,
            project_id:   user.project_id,
            hash:         hash,
            format:       'json',
            filedata:     restler.file(asset_path, null, fs.lstatSync(asset_path).size)
        }, user);

        var options = {
            multipart:  true,
            data:       params
        };

        var upload_res = try_call(3, function() {
            return api_sqdn_post(SQDN_UPLOAD_PATH, options).wait();
        });

        var error = assert_error(upload_res);
        if (error) return error;

        logger.info('  New version ' + upload_res.data['success']['version'] + ' of ' + filename);
    } else {
        logger.info('  Already exists version: ' + res.data['success']['version']);
    }

    version = (upload_res ? upload_res.data['success']['version'] : version);

    logger.info('  Removing asset ' + filename);
    unlink(asset_path);

    return {
        path: current_path,
        file: current_file,
        version: version,
        size: asset_size
    };
};

var load_manifest = function(path) {
    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
        return {};
    }
}

var update_main_manifest = function(files) {
    var manifest_path = path.join(client_root, '/main.json');
    var manifest = load_manifest(manifest_path);
    for (var k in files) {
        manifest[k] = files[k];
    }
    fs.writeFileSync(manifest_path, JSON.stringify(manifest, null, 2), 'utf8');
}

var update_manifests = function(prepared_json) {
    for (var path in prepared_json) {
        var manifest_path = path + '/files.json';
        var files = prepared_json[path];

        logger.info('  Updating manifest ' + manifest_path);
        var manifest = load_manifest(manifest_path);
        for (var k in files) {
            manifest[k] = files[k];
        }

        fs.writeFileSync(manifest_path, JSON.stringify(manifest, null, 2), 'utf8');
    }
};

var try_call = function(count, callback) {
    for (var i = 0; i < count; ++i) {
        try {
            var ret = callback.call();
            return ret;
        } catch (e) { }
    }
    throw new Error("Failled to perform call, all iterations failed");
};
