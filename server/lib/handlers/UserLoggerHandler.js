/**
 * Обработчик, отдающий статический контент
 */

var Mixer = require("../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var UserLoggerHandler = function(core)
{
    this._core = core;
    var _self = this;
    this.query = null;
    this.task = null;

    this.onComplete = function(fname) {
        _self.removeQueryListeners();
        _self.task.reply(200, {}, '{"gamedata":"OK"}');
        _self.emit("complete", null);
    };

    this.onError = function(err) {
        _self.removeQueryListeners();
        _self.task.reply(200, {}, JSON.stringify({error_core:"unknown_user"}));
        _self.emit("complete", null);
    };

    this.removeQueryListeners = function () {
        _self.query.removeListener('complete', _self.onComplete);
        _self.query.removeListener('error',    _self.onError);
    };

    this.addQueryListeners = function () {
        _self.query.addListener('complete', _self.onComplete);
        _self.query.addListener('error', _self.onError);
    }
};

Mixer.mix(UserLoggerHandler.prototype, EventEmitter.prototype);

UserLoggerHandler.prototype.handle = function(task) {
    this.task = task;
    var post = this.task.post;

    if (('gamedata' in post) && (typeof(post['gamedata']) == 'string')) {
        try {
            post['gamedata'] = JSON.parse(post['gamedata']);
        }
        catch (e) {
            this.task.reply(200, {}, JSON.stringify({error_core:"bad_params"}));
            this.emit("complete", null);
            return;
        }
    }

    if (!('social_network' in post)
        || !('social_id'      in post)
        || !('gamedata'       in post)
        || !('reason'         in post.gamedata)
        || !('log'            in post.gamedata)
        ) {
        this.task.reply(200, {}, JSON.stringify({error_core:"bad_params"}));
        this.emit("complete", null);
    }

    this.query = this._core.dataGate.getQuery('addUserLog');
    this.addQueryListeners();
    this.query.run(post.social_network, post.social_id, post.gamedata['reason'], post.gamedata['log']);
};

module.exports = UserLoggerHandler;
