var Scenario = require('../lib/scenario');
var utils = require('../lib/utils');

module.exports = new Scenario(function(player) {
    utils.inspect(player.init());
});
