var Mixer = require("../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var FS = require("fs");
var path = require("path");

var StaticHandler = function(core, path, staticCache) {
    this.path = path;
    this.staticCache = staticCache;
};

Mixer.mix(StaticHandler.prototype, EventEmitter.prototype);

StaticHandler.prototype.handle = function(task) {
    if (task.path in this.staticCache) {
        task.reply(200, {}, this.staticCache[task.path].toString());
    } else {
        var fileName;

        var index = task.path.lastIndexOf("/");
        if (index === -1) {
            fileName = task.path;
        } else {
            if (index == (task.path.length - 1)) {
                task.path = task.path.slice(0, index);
            }

            // ToDo добавить проверок (сейчас рассчитано на путь вида: /static/<path>)
            var chunks = task.path.split("/");
            chunks.shift();
            chunks.shift();
            fileName = chunks.join("/");
        }

        var filePath = path.join(this.path, fileName);

        if (FS.existsSync(filePath) && !FS.lstatSync(filePath).isDirectory()) {
            this.staticCache[task.path] = FS.readFileSync(filePath);
            task.reply(200, {}, this.staticCache[task.path].toString());
        } else {
            task.reply(404, {}, "File not Found");
        }
    }

    this.emit("complete", null);
};

module.exports = StaticHandler;