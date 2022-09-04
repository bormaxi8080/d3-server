var ConsumeStarCommand = function() {};

ConsumeStarCommand.toString = function() {
    return "consume_star";
};

ConsumeStarCommand.prototype.execute = function(value) {
    if (value === 0) return;
    context.system.check_int_positive(value, 'value');
    var stars = context.case.stars();

    if (stars >= value) {
        context.case.setStars(stars - value);
        context.events.animate("stars", stars, stars - value);
    } else {
        throw new LogicError("Недостаточно звезд в деле!\n" + context.case.activeCase() + ', value: ' + value);
    }
};
