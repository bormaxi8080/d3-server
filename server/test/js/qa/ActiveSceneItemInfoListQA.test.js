var helper = require('./../helper');
eval(helper.initContextCode());

describe('ActiveSceneItemInfoListQA', function() {
    subject('QA', function() {
        return ActiveSceneItemInfoListQA;
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
                                "state": "state_1"
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "scenes": {
                    "scene_1": {
                        "items": {
                            "item_1": {
                                "name": "item_1.name",
                                "img": "item_1.img",
                                "layer": "item_1.layer",
                                "linked_layer": "item_1.linked_layer"
                            },
                            "item_2": {
                                "name": "item_2.name",
                                "img": "item_2.img",
                                "layer": "item_2.layer"
                            },
                            "item_3": {
                                "name": "item_3.name",
                                "img": "item_3.img",
                                "layer": "item_3.layer"
                            }
                        },
                        "states": {
                            "default": {},
                            "state_1": {
                                "items": ["item_1", "item_3"]
                            }
                        }
                    }
                }
            });
        });

        it('should return ordered list of active_scene_item_info objects', function() {
            this.QA.handle().should.deep.equal([{
                visible: true,
                text: 'item_1.name',
                layer: 'item_1.layer',
                linkedLayer: "item_1.linked_layer",
                imagePath: 'item_1.img'
            }, {
                visible: false,
                text: 'item_2.name',
                layer: 'item_2.layer',
                linkedLayer: "",
                imagePath: 'item_2.img'
            }, {
                visible: true,
                text: 'item_3.name',
                layer: 'item_3.layer',
                linkedLayer: "",
                imagePath: 'item_3.img'
            }]);
        });
    });
});
