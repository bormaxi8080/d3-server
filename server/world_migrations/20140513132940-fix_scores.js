var _20140513132940 = function() {
    this.name = "fix_scores";
    this.version = 20140513132940;

    var score_changes = {
        case_01: {
            scene_2: {
                from: [250000,500000,1100000,2100000,2600000],
                to: [250000,500000,700000,1100000,1500000]
            },
            bonus_1: {
                from: [50000,100000,2200000,3100000,4200000],
                to: [50000,100000,700000,1100000,1600000]
            }
        },
        case_02: {
            scene_1: {
                from: [600000,1200000,1800000,2400000,3200000],
                to:[450000,900000,1200000,2400000,3200000]
            },
            bonus_1: {
                from: [800000,1400000,2200000,3000000,3600000],
                to: [450000,1000000,1500000,3000000,3600000]
            }
        }
    }

    var requires_fix = function(case_id, scene_id, scene) {
        if (scene.stars < 5 && score_changes[case_id] && score_changes[case_id][scene_id]) {
            return scene.score > score_changes[case_id][scene_id].to[scene.stars];
        } else {
            return false;
        }
    };

    var fix_scores = function(case_id, scene_id, scene) {
        if (requires_fix(case_id, scene_id, scene)) {
            var change = score_changes[case_id][scene_id];
            scene.score = Math.ceil(scene.score / change.from[scene.stars] * change.to[scene.stars]);
        }
    }

    this.execute = function(world, rooms) {
        for (var case_id in world.open_cases) {
            var scenes = world.open_cases[case_id].opened_scenes;
            for (var scene_id in scenes) {
                var scene = scenes[scene_id];
                if (scene.scores) {
                    fix_scores(case_id, scene_id, scene);
                    delete scene.scores;
                }
            }
        }
    };
};

module.exports = new _20140513132940();
