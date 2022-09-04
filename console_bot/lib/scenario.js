var path = require('path');
var ROOT_PATH = path.resolve(path.join(__dirname, '..'));

var Scenario = module.exports = function(flow) {
    this.flow = flow
};

Scenario.prototype.execute = function(player, partners) {
    this.flow(player, partners);
};

Scenario.by_id = function(scenario_id) {
    return require(path.join(ROOT_PATH, 'scenarios', scenario_id));
}
