var RateAppCommand = function() { };

RateAppCommand.toString = function() {
    return "rate_app";
};

RateAppCommand.prototype.execute = function() {
    if (context.options.isRateConditionCompleted()) {
        context.events.rateApp();
        context.storage.set_property(context.options.rateTimeProp, context.last_command_time());
    }
};
