var _20140516114404 = function() {
    this.name = "case_1_2_3_scores_lab_items";
    this.version = 20140516114404;

    var score_changes = {
        case_01: {
            scene_2: {
                from: [250000,500000,700000,1100000,1500000],
                to: [200000,400000,600000,900000,1200000]
            },
            bonus_1: {
                from: [50000,100000,700000,1100000,1600000],
                to: [50000,100000,400000,700000,1000000]
            }
        },
        case_02: {
            scene_1: {
                from: [450000,900000,1200000,2400000,3200000],
                to:[350000,700000,1100000,1800000,2200000]
            },
            scene_2: {
                from: [700000,1400000,2000000,2800000,3400000],
                to:[400000,700000,1100000,1800000,2200000]
            },
            scene_3: {
                from: [900000,1600000,2300000,3100000,3800000],
                to:[600000,1100000,1800000,2400000,2800000]
            },
            bonus_1: {
                from: [450000,1000000,150000,3000000,3600000],
                to: [400000,800000,1200000,1800000,2400000]
            },
            bonus_2: {
                from: [600000,1200000,1800000,2400000,3600000],
                to: [400000,800000,1100000,1600000,2000000]
            }
        },
        case_03: {
            scene_1: {
                from: [1100000,1600000,2200000,2900000,3700000],
                to: [800000,1600000,2200000,2900000,3700000]
            },
            scene_2: {
                from: [1400000,1900000,2500000,3200000,4000000],
                to: [700000,1900000,2500000,3200000,4000000]
            },
            scene_3: {
                from: [1200000,1700000,2300000,3000000,3800000],
                to: [800000,1700000,2300000,3000000,3800000]
            },
            bonus_1: {
                from: [1000000,1500000,2100000,2800000,3600000],
                to: [700000,1500000,2100000,2800000,3600000]
            }
        },

    }

    this.execute = function(world, rooms, context) {
        this.utils.migrate_scene_score(world, score_changes);
    }
};
module.exports = new _20140516114404();