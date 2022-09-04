var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var ROOT_PATH = fs.realpathSync(__dirname + '/../..');

namespace('build', function() {
    namespace('client', function() {
        desc('Сборка файлов для мобильных клиентов(all.js + all.querystring.encode(obj, sep, eq, name);.gz');
        task('mobile', [], function() {
            var taskUtils = require('./utils.js');
            var quotePath = taskUtils.quotePath;
            var Utils = require('../lib/core/Utils');

            console.log("build mobile..");

            var f_path = "/static/assets/mobile/all.js";
            var full_path = path.normalize(path.join(ROOT_PATH, f_path));
            Utils.ensureDirSync(path.dirname(full_path));

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
                    '/js/createDefinitions.js'
                ],
                result_file: f_path
            };

            Utils.combine_context_js_for_server(ROOT_PATH, settings, true, false);

            var cmd = 'gzip -c ' + quotePath(full_path) + ' > ' + quotePath(full_path, '.gz');

            exec(cmd, function(error, stdout, stderr) {
                if(error){
                    console.log(cmd);
                    console.log(stderr);
                    return fail();
                }
                console.log(taskUtils.green + "mobile build done" + taskUtils.reset);
                complete();
            }, {printStderr: true});
        },true);
    });
});
