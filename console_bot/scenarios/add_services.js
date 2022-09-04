var Scenario = require('../lib/scenario');
var utils = require('../lib/utils');

module.exports = new Scenario(function(player, partners) {
    player.ensure_inited();
    partners.forEach(function(partner) {
        partner.ensure_inited();
        partner.reset();
        partner.init();
        partner.execute("open_case", {case: "case_01"});
        partner.apply_triggers();
        partner.execute("invite_partner", {partner: player.hybrid_id});
        partner.execute("start_scene", {scene: "scene_1", boosters:[], hints: 1, partner: player.hybrid_id});
        partner.execute("end_scene", {scene: "scene_1", scores: 500000});
        partner.apply_triggers();
        partner.execute("broadcast_unlock_request", {case: "case_03"});
        partner.apply_batch();
    });
});
