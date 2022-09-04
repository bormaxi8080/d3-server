var helper = require('./../helper');
eval(helper.initContextCode());

describe('case_04', function() {
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
            "unlocked_cases": ["case_04"],
            "open_cases": {}
        });
        // Hack to make tests smaller, faster and cleaner
        helper.sandbox.stub(context.hog, "sceneMaxScore", function() {
            return 1000000000;
        });

        Executor.run("open_case", {"case": "case_04"});
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
        Executor.run("start_scene", {"scene": "bonus_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_1", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        context.energy.refill();
        Executor.run("start_scene", {"scene": "bonus_2", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_2", "time": 1010000, "scores": 1000000000});
        Executor.run("click_task", {"index": 2});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "body", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "torn_paper", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "bullet", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "victim_blood", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "victim_blood", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "house_plan", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_2", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_2", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "leaves", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_3", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_3", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "broken_glass", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "baseball_bat", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "baseball_bat", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "amanda_may", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "bank_account", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "hallowell", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("click_task", {"index": 1});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "model_search", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "becky_stone", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "model_survey", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "model_survey", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_4", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_4", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "becky_stone", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "onboard_computer", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "onboard_computer", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "ozzy", "time": 66845000});
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
        Executor.run("start_scene", {"scene": "scene_5", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_5", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "camera_recording", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "note", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "bloody_bandages", "time": 1020000});
        Executor.run("click_lab_item", {"lab_item": "bloody_bandages", "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_6", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_6", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "gun", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "gun", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 222620000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "mobile_phone", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "ozzy", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "ozzy", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_3", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_3", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "fake_contract", "time": 1250000});
        Executor.run("end_minigame", {"energy": 9, "time": 1300000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_1", "time": 1002000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_1", "time": 1010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "hallowell", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");

        // console.log(JSON.stringify(context.storage.getDump(), null, 4));
    });
});