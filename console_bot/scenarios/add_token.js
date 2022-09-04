var Scenario = require('../lib/scenario');
var utils = require('../lib/utils');

module.exports = new Scenario(function(player, partners) {
    player.set_token("player_tokenizer_1");
    player.set_token("player_tokenizer_2");
});
