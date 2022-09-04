function Options() { }

Options.prototype.rateTimeProp = "options.rate.time";
Options.prototype.rateTime = function() {
    return context.storage.get_property_or_default(this.rateTimeProp, 0);
};

Options.prototype.lastDayStart = function() {
    return context.storage.get_property_or_default("options.last_day_start", 0);
};

Options.prototype.isRatedToday = function() {
    return (this.rateTime() >= this.lastDayStart());
};

Options.prototype.isRateConditionCompleted = function() {
    return context.player.get_level() >= 6
        && context.case.isOpened("case_02")
        && !this.isRatedToday();
};
