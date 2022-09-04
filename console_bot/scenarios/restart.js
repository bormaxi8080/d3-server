var Scenario = require('../lib/scenario');

module.exports = new Scenario(function(player) {
    player.reset();
    player.init();
    player.execute("open_case", {case: "case_01"});
    player.apply_triggers();
    player.execute("start_scene", {scene: "scene_1", boosters:[], hints: 1});
    player.execute("end_scene", {scene: "scene_1", scores: 0});
    player.apply_triggers();
    player.execute("click_lab_item", {lab_item: "body"});
    player.execute("click_lab_item", {lab_item: "body"});
    player.execute("click_lab_item", {lab_item: "body"});
    player.apply_triggers();
});
