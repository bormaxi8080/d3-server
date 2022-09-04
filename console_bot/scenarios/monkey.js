var Fiber = require('fibers');
var Scenario = require('../lib/scenario');
var PlayerHelper = require('../lib/player_helper');

// monkey scenario flow function
module.exports = new Scenario(function(player) {
    console.time('game loop');
    var h = new PlayerHelper(player);
    h.run();
    console.timeEnd('game loop');
});
