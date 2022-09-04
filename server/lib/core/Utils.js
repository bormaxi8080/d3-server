/*
 * TODO после полного перезда на logic.js необходимо провести полный рефактор
 * убрать дублирующиеся действия в jake и BuildStateHandler
 * ensureDirSync должно проверяться тут, а не в jake и BuildStateHandler
 * заменить ensureDir в jake на ensureDirSync
 * перенести настройки шаблонов в Utils
 * избавиться от лишних ф-ции, возможно, объединить некоторые ф-ции
 * переделать glob на https://github.com/isaacs/node-glob
 *
 * Используется для формирования
 * 1. логики и дефов для клиента (таски в tasks/flash.js)
 * 2. данных для батч раннера (таск build:server)
 * 3. данных для мобилок (таск build:mobile)
 *
 * 4. логики, дефов, батч раннера при сборке в админке HandlerBuildServer
 */
var fs = require("fs");
var path = require("path");
var wrench = require("wrench");
var glob = require("glob");
var localeUtils = require("./locale/LocaleUtils");
var execSync = require("exec-sync");

// Настройки шаблонов.
var CREATE_CONTEXT_CONTAINER = '/js/createContext.js';
var CREATE_CONTEXT_MARKER = '/* JS_INCLUDES_MARKER */';

var BUF_LENGTH = 128 * 1024;  // Размер буфера используемого при копировании

/**
 * Проверяет наличие директории, при её отсутствии пытается создать.
 *
 * @params dir {string} путь к директории
 */
var ensureDirSync = function(dir) {
    dir = dir.replace(/^"*/, "").replace(/"*$/, "");
    if (!fs.existsSync(dir))
        wrench.mkdirSyncRecursive(dir, 0777);
    return dir;
};
exports.ensureDirSync = ensureDirSync;

/**
 * Синхронное копирование файла. С использованием буфера ограниченого размера.
 *
 * @param srcFile {string} откуда
 * @param destFile {string} куда
 */
var copySync = function(srcFile, destFile) {
    var buff = new Buffer(BUF_LENGTH);
    var fdr = fs.openSync(srcFile, 'r');
    var fdw = fs.openSync(destFile, 'w');
    var bytesRead = 1;
    var pos = 0;
    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    }
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead
    fs.closeSync(fdr);
    fs.closeSync(fdw);
};
//exports.copySync = copySync;

/**
    Добавляем ковычки спереди и вконце строки, если их еще нет
    @param path строка, которую оборачиваем в ковычки
*/
var quotePath = function (path) {
    return path.replace(/^"*/, "\"").replace(/"*$/, "\"");
};

exports.quotePath = quotePath;

/**
 * Синхронное копирование директории
 *
 * @param src_path {string}
 * @param dest_path {string}
 */
exports.copyDirSync = function(src_path, dest_path) {
    require("wrench").copyDirSyncRecursive(src_path, dest_path);
};

if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

if (typeof(String.prototype.chomp) === "undefined") {
    String.prototype.chomp = function(separator) {
        return String(this).replace(new RegExp(separator ? separator + "+$" : "(\r|\n)+$"), '');
    }
}

var hasFields = function(object, fields) {
    var len = fields.length;
    while (len--)
        if (!(fields[len] in object))
            return false;
    return true;
};

exports.hasFields = hasFields;

exports.hasBlankFields = function(object, fields) {
    var len = fields.length;
    while (len--)
        if (!(fields[len] in object) || object[fields[len]] == "")
            return true;

    return false;
}

// TODO везде заменить работу на glob на https://github.com/isaacs/node-glob
if (typeof(fs.dirglobSync) === "undefined") {
    fs.dirglobSync = function(dir, pattern, exclude_dir_pattern) {
        var res = [];
        var files = fs.readdirSync(dir);
        for (var i in files) {
            var entry = files[i];
            var full_path = path.join(dir, entry);
            if (fs.statSync(full_path).isDirectory() && (!exclude_dir_pattern || !full_path.match(exclude_dir_pattern))) {
                res = res.concat(fs.dirglobSync(full_path, pattern, exclude_dir_pattern));
            } else {
                if (entry.match(pattern))
                    res.push(full_path);
            }
        }
        return res;
    }
}

var js_begin = function(js_func_name) {
    return "function " + js_func_name + "() { return {";
};

var js_end = function() {
    return "  } };";
};

var collect_js_files_list = function(paths, excludes) {
    var files = [].concat.apply([], paths.map(function(file_path) {
        return glob.sync(path.join(file_path, "/**/*.js")).map(path.normalize);
    }));

    if (excludes && excludes.length) {
        excludes = excludes.map(path.normalize);
        files = files.filter(function(name) {
            return !excludes.some(function(exclude) {
                return (name.indexOf(exclude) >= 0);
            });
        });
    }

    return files;
};

exports.combine_context_js_for_server = function(root_path, settings, add_defs, add_exports) {
    combine_context_js(root_path, settings, false, add_defs, add_exports);
};

exports.combine_context_js_with_links = function(root_path, settings, add_defs) {
    combine_context_js(root_path, settings, true, add_defs, false);
};


var combine_definitions_reqursively = function(defsDir, dir, localeInfo) {
    var s = "";
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var entry = files[i];
        if (entry == '..' || entry == '.' || entry == '.git' || entry == 'src' || entry == 'localization' ||
            entry == 'build' || entry == 'migration' || entry == 'test' || entry == 'mapeditor' || entry == 'schema')
        {
            continue;
        }
        var full_path = path.join(dir, entry);
        if (fs.statSync(full_path).isDirectory()) {
            s += "\"" + entry + "\": {\n";
            s += combine_definitions_reqursively(defsDir, full_path, localeInfo);
            s += "},\n";
        } else {
            if (!entry.match(/\.js$/) && !entry.match(/\.json$/))
                continue;
            var property_name = full_path.match(/.*[\\\/]([^.]+).*/)[1];
            var body = fs.readFileSync(full_path, 'utf8');
            if (localeInfo)
                body = localeUtils.replaceDefLocale(defsDir, body, full_path, localeInfo);
            if (!body)
                body = '{}';
            s += "\n        \"" + property_name.trim() + "\":" + body.trim() + ",";
        }
    }

    return s.chomp().chomp(',');
};

var combine_definitions = function(dir) {
    var localeInfo = localeUtils.getLocaleInfo(dir);
    var json = "{" + combine_definitions_reqursively(dir, dir, localeInfo).chomp().chomp(',') +  "}";
    var js = "var definitions = " + JSON.stringify(JSON.parse(json), null, 2);
    return js;
};

var combine_context_js = function(root_path, settings, links_only, add_defs, add_exports) {
    var i;
    var contents;

    if (!('container' in settings)) settings.container = CREATE_CONTEXT_CONTAINER;
    if (!('container_marker' in settings)) settings.container_marker = CREATE_CONTEXT_MARKER;
    if (!('context_initialize' in settings)) settings.context_initialize = true;

    var paths = [];
    var len = settings.js_paths.length;
    while (len--) {
        paths.push(fs.realpathSync(path.join(root_path, settings.js_paths[len])));
    }

    var path_result_file = path.join(root_path, settings.result_file);
    ensureDirSync(path.dirname(path_result_file));

    var jsContainer = fs.readFileSync(root_path + settings.container, 'utf8');
    var jsContainerSplitted = jsContainer.split(settings.container_marker, 2);

    if (jsContainerSplitted.length != 2) {
        throw new Error('Error on split container.');
    }
    var fd = fs.openSync(path_result_file, 'w');

    var header_lines = [
        '/**',
        ' * Automatically generated',
        ' * From commit: ' + execSync('git rev-parse HEAD'),
        ' * Collected from folders:',
        ' *    Definitions:',
        ' *       ' + settings.defs_path,
        ' *    Logic:'
    ];
    header_lines.push(' *       ' + settings.js_paths.join("\n *       "));
    header_lines.push(' */', '');

    fs.writeSync(fd, header_lines.join("\n"));
    fs.writeSync(fd, jsContainerSplitted[0]);

    if (settings.context_initialize) {
        fs.writeSync(fd, "\nvar context = null;");
    }

    fs.writeSync(fd, "\n");

    //добавляем файлы js логики
    var jsFiles = collect_js_files_list(paths, settings.exclude_js_files);
    for (i = 0; i < jsFiles.length; i++) {
        if (links_only) {
            fs.writeSync(fd, '    include ' + JSON.stringify(jsFiles[i]) + '\n');
        } else {
            header_lines = [
                '/**',
                ' * File: ' + path.relative(root_path, jsFiles[i]),
                ' */'
            ];
            fs.writeSync(fd, header_lines.join("\n"));

            contents = fs.readFileSync(jsFiles[i], 'utf8');
            fs.writeSync(fd, "\n" + contents + "\n");
        }
    }

    if (add_defs) {
        var path_defs_folder = fs.realpathSync(path.join(root_path, settings.defs_path));
        var definitions = combine_definitions(path_defs_folder);

        if (links_only) {
            var fDefs = fs.openSync(path.dirname(path_result_file) + '/defs.js', 'w');
            fs.writeSync(fDefs, definitions);
            fs.closeSync(fDefs);

            fs.writeSync(fd, "\n    include \"./defs.js\"\n");
        } else {
            fs.writeSync(fd, "\n\n" + definitions + "\n");
        }
    }

    fs.writeSync(fd, jsContainerSplitted[1]);

    if (add_exports) {
        fs.writeSync(fd, "exports.createContext = createContext;");
    }

    fs.closeSync(fd);
};

exports.combine_context_js = combine_context_js;

exports.params_to_url = function(params, separator) {
    var params_string = "";
    if (!separator)
        separator = "&";
    for (var param in params) {
        params_string += param + "=" + params[param] + separator
    }

    return params_string.replace(/(\s+)?.$/, '');
}

var EventEmitterExt = require('./EventEmitterExt');
var QueryCall = function(dataGate, name, params) {
    var callStack = new Error().stack;
    return new EventEmitterExt(function(emitter) {
        try {
            var query = dataGate.getQuery(name);
            query.addListener('complete', function () {
                query.removeAllListeners();
                emitter.emit('success', query.result, params);
            });
            query.addListener('error', function () {
                query.removeAllListeners();
                emitter.emit('error', query.error, params);
            });
            query.run.apply(query, params);
        } catch (e) {
            console.log('------', e.stack, '++++++++', callStack)
            process.nextTick(function(){
                emitter.emit('error', e.message);
            })
        }
    }).run()
};

exports.QueryCall = QueryCall;