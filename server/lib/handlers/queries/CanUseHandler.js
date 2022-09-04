/**
 *   Обработчик
 */

var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var CanUseHandler = function(core)
{
    var _task;
    var _params;
    var _core = core;

    this.handle = function(task)
    {
        _task = task;
        _params = _task.post;
        _query = _core.dataGate.getQuery('createUseShare');

        _query.addListener('complete', sendResult);
        _query.addListener('error', sendResult);

        _query.run(_params['social_id'], _params['social_network'], _params);
    };

    var sendResult = function()
    {
        _query.removeAllListeners();
        _task.reply(200, {"Set-Cookie": "post_id=; path=/; expires=Thu, 10 Dec 1970 15:05:15 GMT"}, JSON.stringify(_query.result));
        this.emit('complete', null);
    };
};

Mixer.mix(CanUseHandler.prototype, EventEmitter.prototype);
module.exports = CanUseHandler;