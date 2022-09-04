var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var EventEmitterExt = require("../../core/EventEmitterExt");
var CallChainer = require("../../core/CallChainer");
var QueryCall = require("../../core/Utils").QueryCall;

var UserSavedStatesListHandler = function (core, next) {
    this.core = core;
    this.next = next;
};

UserSavedStatesListHandler.prototype.handle = function (task) {
    var self = this;
    var params = task.post;

    self.core.cqueries.getUser.run(params.social_network, params.social_id, true, function(err, user) {
        if (err) {
            self.sendResult(task, 500, {status: 'error', error: error});
        }

        QueryCall(core.dataGate, "getUserSavesStatesList", [user.shard, user.id])
        .success(function(list) {
            self.sendResult(task, 200, {status: 'OK', data: list});
        })
        .error(function(error) {
            self.sendResult(task, 500, {status: 'error', error: error});
        });
    });
};

UserSavedStatesListHandler.prototype.sendResult = function(task, code, body) {
    if (typeof(body) == 'object') body = JSON.stringify(body);
    task.reply(code, {}, body);
    self.emit('complete', null);
};

Mixer.mix(UserSavedStatesListHandler.prototype, EventEmitter.prototype);

module.exports = UserSavedStatesListHandler;
