var EnergyIncrementCountQA = {};

EnergyIncrementCountQA.handle = function(time) {
    return context.energy.get_increment_count(time);
};
