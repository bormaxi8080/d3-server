var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var ROOT_PATH = fs.realpathSync(__dirname + '/../../');
var mochaPath = path.join(__dirname, "../node_modules/.bin/mocha");

desc('Запуск тестов');
task('test', ['test:execute'], function () {
    complete();
}, true);

namespace('test', function() {
    desc('запуск тестов');
    task('execute', ["combine_test_js"], function() {
        var mocha = spawn(mochaPath, [path.join(ROOT_PATH, 'server/test/'), '--recursive', '-R', 'dot'], { stdio: 'inherit' });
        mocha.on('close', function (code) {
            if (code !== 0) {
                console.log('Tests finished with code ' + code)
                fail();
            } else {
                complete();
            }
        });
    }, true);

    task("combine_test_js", [], function() {
        var Utils = require('../lib/core/Utils');
        Utils.ensureDirSync(path.join(ROOT_PATH, 'server/tmp/test/js'));

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
            result_file: "server/tmp/test/js/all.js",
            container: "/js/createContext.js",
            container_marker: "/* JS_TEST_INCLUDES_MARKER */",
            context_initialize: true
        };
        Utils.combine_context_js_for_server(ROOT_PATH, settings, true, false);

        complete();
    }, true);
});

