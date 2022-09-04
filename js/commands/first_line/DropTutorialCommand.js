var DropTutorialCommand = function() {};

DropTutorialCommand.toString = function() {
    return "drop_tutorial";
};

DropTutorialCommand.prototype.execute = function(args) {
    context.storage.set_property("tutorial", null);
    context.events.notify("tutorial", null);
    context.track.adx_event("TutorFinish", "1");
};
