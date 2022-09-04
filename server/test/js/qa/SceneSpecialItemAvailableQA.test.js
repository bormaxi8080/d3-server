var helper = require('./../helper');
eval(helper.initContextCode());

describe('SceneSpecialItemAvailableQA', function() {
    subject('QA', function() {
        return SceneSpecialItemAvailableQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                },
                "open_cases": {
                    "case_01": {
                        "opened_scenes": {
                            "scene_1": {
                                "state": "state_1"
                            },
                            "scene_2": {
                                "state": "default"
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "scenes": {
                    "scene_1": {
                        "items": {
                            "item_1": {},
                            "item_2": {},
                            "item_3": {}
                        },
                        "states": {
                            "default": {},
                            "state_1": {
                                "items": ["item_1", "item_3"]
                            }
                        }
                    },
                    "scene_2": {
                        "items": {
                            "item_1": {}
                        },
                        "states": {
                            "default": {},
                            "state_1": {
                                "items": ["item_1"]
                            }
                        }
                    }
                }
            });
        });

        it('should return true if any items are present in state available', function() {
            this.QA.handle("scene_1").should.be.true;
        });

        it('should return false if no items are present in state available', function() {
            this.QA.handle("scene_2").should.be.false;
        });
    });
});
