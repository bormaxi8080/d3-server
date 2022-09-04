var helper = require('./../helper');
eval(helper.initContextCode());

describe('case_01', function() {
    it('should be playable', function() {
        helper.setContextWorld(context, {
            "player": {
                "exp": 0,
                "level": 1,
                "game_balance": 3000,
                "real_balance": 100,
                "energy": {
                    "current": 100,
                    "increment_time": 1001000
                },
                "gender": "male",
                "boosters": {}
            },
            "options": {
                "random_seed": 22,
                "init_time": 1000000,
                "last_command_time": Date.now()
            },
            "immediate_data": {
                "analyzed_items": {},
                "triggers": {}
            },
            "partners": {},
            "tutorial": {"state": "tutor_start"},
            "new_cases": {},
            "unlocked_cases": ["case_01"],
            "open_cases": {}
        });

        // Hack to make tests smaller, faster and cleaner
        helper.sandbox.stub(context.hog, "sceneMaxScore", function() {
            return 1000000000;
        });

        Executor.run("open_case", {"case": "case_01"});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_1", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "body", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "body", "time": 22620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_1", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "knife", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "musician", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "credit_card", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "credit_card", "time": 22620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "player", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "bonus_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_1", "time": 1010000, "scores": 10000000});
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_2", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_2", "time": 1010000, "scores": 320000})
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "note", "time": 107410000});
        Executor.run("end_minigame", {"energy": 9, "time": 107411000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "note", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "note", "time": 22620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "smartphone", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "smartphone", "time": 22620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_2", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_2", "time": 1010000, "scores": 320000})
        Executor.run("click_suspect", {"suspect": "player", "time": 82000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        // console.log(JSON.stringify(context.storage.getDump(), null, 4));
    });
});