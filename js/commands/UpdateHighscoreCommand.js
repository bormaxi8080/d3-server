var UpdateHighscoreCommand = function() { };

UpdateHighscoreCommand.toString = function() {
    return "update_highscore"
};

UpdateHighscoreCommand.prototype.execute = function(scene_id, new_score) {
    var old_score = context.case.highscore(scene_id);
    if (new_score > old_score) {
        Executor.run(RateAppCommand)
        context.storage.set_property(context.case.highscoreProp(scene_id), new_score);
    }
};
