var helper = require('./../helper');
eval(helper.initContextCode());

describe('ActiveSceneItemCountQA', function() {
    subject('QA', function() {
        return ActiveSceneItemCountQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1",
                    }
                },
                "open_cases": {
                    "case_01": {
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 2,
                                "state": "state_1"
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "scenes": {
                    "scene_1": {
                        "type": "hog",
                        "states": {
                            "state_1": {}
                        }
                    }
                }
            });
        });

        it('should return active_scene_item_count', function() {
            this.QA.handle().should.equal(9);
        });
    });
});
