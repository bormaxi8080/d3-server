var helper = require('./../helper');
eval(helper.initContextCode());

describe('HasUnfinishedSceneQA', function() {
    subject('QA', function() {
        return HasUnfinishedSceneQA;
    });

    describe('#handle', function() {
        it('should return true on existing active scene', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1"
                    }
                }
            });

            this.QA.handle().should.be.true;
        });

        it('should return false if no active scene exists', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                }
            });

            this.QA.handle().should.be.false;
        });
    });
});
