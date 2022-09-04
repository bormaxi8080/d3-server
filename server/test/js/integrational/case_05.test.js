var helper = require('./../helper');
eval(helper.initContextCode());

describe('case_05', function() {
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
            "unlocked_cases": ["case_05"],
            "open_cases": {}
        });

        // Hack to make tests smaller, faster and cleaner
        helper.sandbox.stub(context.hog, "sceneMaxScore", function() {
            return 1000000000;
        });

        Executor.run("open_case", {"case": "case_05"});
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
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "body", "time": 1020000});
        Executor.run("end_minigame", {"energy": 9, "time": 1030000});
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
        Executor.run("click_lab_item", {"lab_item": "sled", "time": 1350000});
        Executor.run("start_scene", {"scene": "bonus_1", "time": 1360000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_1", "time": 1400000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "sled", "time": 4950000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "pistol", "time": 22621000});
        Executor.run("end_minigame", {"energy": 9, "time": 22622000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "tyler", "time": 22800000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_2", "time": 23000000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_2", "time": 23010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "bonus_2", "time": 23000000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_2", "time": 23010000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "bonus_3", "time": 23000000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "bonus_3", "time": 23010000, "scores": 1000000000});
        Executor.run("click_lab_item", {"lab_item": "scotch", "time": 23510000});
        Executor.run("start_minigame", {"forensic_item": "woman_purse", "time": 23540000});
        Executor.run("end_minigame", {"energy": 9, "time": 23550000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "scotch", "time": 45110000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "smartphone", "time": 23580000});
        Executor.run("end_minigame", {"energy": 9, "time": 23590000});
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
        Executor.run("start_scene", {"scene": "scene_3", "time": 45200000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_3", "time": 45210000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "security_cam", "time": 45220000});
        Executor.run("click_lab_item", {"lab_item": "security_cam", "time": 66820000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "club_photos", "time": 66830000});
        Executor.run("end_minigame", {"energy": 9, "time": 66840000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "tyler", "time": 66845000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "ronsun_watch", "time": 66860000});
        Executor.run("end_minigame", {"energy": 9, "time": 66865000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "bolton", "time": 66880000});
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
        Executor.run("start_scene", {"scene": "scene_4", "time": 66900000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_4", "time": 66910000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "cocaine_pack", "time": 66920000});
        Executor.run("click_lab_item", {"lab_item": "cocaine_pack", "time": 81330000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "bolton", "time": 82000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");

        Executor.run("click_suspect", {"suspect": "banksy", "time": 82050000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "tyler", "time": 82060000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_5", "time": 82070000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_5", "time": 82080000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "scotch_2", "time": 82100000});
        Executor.run("end_minigame", {"energy": 9, "time": 82200000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "drug", "time": 82101000});
        Executor.run("start_minigame", {"forensic_item": "stack_of_photos", "time": 82110000});
        Executor.run("end_minigame", {"energy": 9, "time": 82120000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "drug", "time": 125301000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "banksy", "time": 125302000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "tyler", "time": 125310000});
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "bolton", "time": 125310000});
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "banksy", "time": 125310000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "tyler", "time": 82080000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_6", "time": 82070000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_6", "time": 82080000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "documents", "time": 103680000});
        Executor.run("end_minigame", {"energy": 9, "time": 125280000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "morgan", "time": 125280000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_6", "time": 103680000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_6", "time": 103690000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "morgans_tablet", "time": 103690000});
        Executor.run("end_minigame", {"energy": 9, "time": 103700000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "morgans_photos", "time": 103710000});
        Executor.run("end_minigame", {"energy": 9, "time": 303720000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "morgans_mail", "time": 103730000});
        Executor.run("end_minigame", {"energy": 9, "time": 303740000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "morgans_letter", "time": 103750000});
        Executor.run("click_lab_item", {"lab_item": "morgans_letter", "time": 125301000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "dianas_letter", "time": 103760000});
        Executor.run("click_lab_item", {"lab_item": "dianas_letter", "time": 125301000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_lab_item", {"lab_item": "analyze_morgan_accounts", "time": 103760000});
        Executor.run("click_lab_item", {"lab_item": "analyze_morgan_accounts", "time": 125301000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_scene", {"scene": "scene_5", "time": 107400000, "boosters": [], "hints": 1});
        Executor.run("end_scene", {"scene": "scene_5", "time": 107410000, "scores": 1000000000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("start_minigame", {"forensic_item": "money_bundle", "time": 107410000});
        Executor.run("end_minigame", {"energy": 9, "time": 107411000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "morgan", "time": 107411000});
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("execute_next_trigger");
        Executor.run("click_suspect", {"suspect": "morgan", "time": 107411000});
        Executor.run("execute_next_trigger");
        Executor.run("click_task", {"index": 0});
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
        // console.log(JSON.stringify(context.storage.getDump(), null, 4));
    });
});

