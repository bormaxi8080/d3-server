var helper = require('./../helper');
eval(helper.initContextCode());

describe('case_02', function() {
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
            "new_cases": {},
            "unlocked_cases": ["case_02"],
            "open_cases": {}
        });

        // Hack to make tests smaller, faster and cleaner
        helper.sandbox.stub(context.hog, "sceneMaxScore", function() {
            return 1000000000;
        });

        Executor.run("open_case", {"case": "case_02"});
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
        Executor.run("start_scene", {"scene": "bonus_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_1", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "bonus_2", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_2", "time": 1010000, "scores": 1000000000});
        Executor.run("click_lab_item", {"lab_item": "film", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "film", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_1", "time": 1010000, "scores": 900000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "doorhandle", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "fingerprint", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "fingerprint", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_1", "time": 1010000, "scores": 800000});
        Executor.run("click_suspect", {"suspect": "stanley_priest", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "priest_alibi", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "priest_alibi", "time": 119000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "stanley_priest", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 1});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_2", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_2", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "trash", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "dictophone", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "dictophone", "time": 222620000});
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
        Executor.run("click_suspect", {"suspect": "scott_pavi", "time": 66845000});
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
        Executor.run("start_scene", {"scene": "scene_3", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_3", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "money", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "money", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "scott_pavi", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "gregory_jarvi", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "voice", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "gregory_jarvi", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "camera_recording", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "camera_recording", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "gregory_jarvi", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        context.energy.refill();
        Executor.run("click_suspect", {"suspect": "gregory_jarvi", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "scott_pavi", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        //console.log(JSON.stringify(context.storage.getDump(), null, 4));
    });
});