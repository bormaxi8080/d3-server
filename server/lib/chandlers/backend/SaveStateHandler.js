var JSONUtils = require("../../data/JSONUtils");
var DataStorage = require('../../core/process/DataStorage');

var SaveStateHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
};

SaveStateHandler.prototype.handle = function(task, callback) {
    var self = this;

    var params = task.post;
    var location = task.current_location;

    var state_error     = 'save_state_error';
    var social_id_error = 'social_id_error';
    var session_error   = 'save_session_error';

    this.task = task;

    try {
        var state = JSON.parse(params.state);
    } catch (err) {
        this.handleError(err, state_error);
        return callback(err, null);
    }

    if (!state.player || !state.player.social_id) {
        var err = new Error('SocialID not set');
        this.handleError(err, social_id_error);
        return callback(err, null);
    }

    if (state.player.social_id != location['map_social_id']) {
        var err = new Error('player.social_id in dump is not ' + location['map_social_id']);
        this.handleError(err, social_id_error);
        return callback(err, null);
    }

    if (!state.map || !state.map.options || !state.map.options.location || !state.map.options.location.map_social_id) {
        var err = new Error('map.options.location.map_social_id not found');
        this.handleError(err, social_id_error);
        return callback(err, null);
    }

    if (state.player.social_id != state.map.options.location.map_social_id) {
        var err = new Error('player.social_id, map.options.location.map_social_id must be identically');
        this.handleError(err, social_id_error);
        return callback(err, null);
    }

    if (task.post.room_id) {
        room_id = task.post.room_id;
        state.map.options.location.current_room = room_id;
    } else {
        room_id = state.map.options.location.current_room;
    }

    var session_data = task.data;
    session_data.setWorld(state);
    session_data.flush()
    .success(function() {
        session_data.store()
        .success(function() {
            self.replySuccess('OK');
            return callback(null, null);
        }).error(function(err) {
            self.handleError(err, session_error);
            return callback(err, null);
        });
    }).error(function(err) {
        self.handleError(err, session_error);
        return callback(err, null);
    });
};

SaveStateHandler.prototype.replySuccess = function(body) {
    this.task.next = this.next;
    this.task.reply(200, {}, body);
};

SaveStateHandler.prototype.handleError = function(err, message) {
    if (err) this.logger.error('SaveStateHandler error', err);
    this.task.reply(200, {}, { error_code: message });
};

module.exports = SaveStateHandler;
