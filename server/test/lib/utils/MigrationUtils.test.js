var helper = require('./../helper');
var MigrationUtils = helper.require("utils/MigrationUtils");

describe('MigrationUtils', function() {
    beforeEach(function() {
        this.score_map = {
            case_01: {
                scene_1: {
                    from: [100000,200000,300000,400000,500000],
                    to: [100000,100000,100000,100000,100000]
                }
            }
        };

        this.scene_1 = {
            stars: 1,
            score: 100000
        };

        this.scene_2 = {
            stars: 1,
            score: 100000
        };

        this.world = {
            open_cases: {
                case_01: {
                    opened_scenes: {scene_1: this.scene_1, scene_2: this.scene_2}
                }
            }
        };
    });

    describe('.migrate_scene_score', function() {
        it('updates scenes score', function() {
            MigrationUtils.migrate_scene_score(this.world, this.score_map);
            this.scene_1.score.should.equal(50000);
            this.scene_2.score.should.equal(100000);
        });
    });


    describe('.recalc_score', function() {
        describe('when scene requires recalc', function() {
            it('recalcs score', function() {
                MigrationUtils.recalc_score(this.score_map, 'case_01', 'scene_1', this.scene_1).should.equal(50000);
            });
        });

        describe('when scene does not requires recalc', function() {
            it('does not recalc score', function() {
                MigrationUtils.recalc_score(this.score_map, 'case_01', 'scene_2', this.scene_2).should.equal(100000);
            });
        });
    });
});
