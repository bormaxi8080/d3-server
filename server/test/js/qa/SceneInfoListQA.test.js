var helper = require('./../helper');
eval(helper.initContextCode());

describe('SceneInfoListQA', function() {
    subject('QA', function() {
        return SceneInfoListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": { "active_case": "case_01" },
                "open_cases": {
                    "case_01": {
                        "opened_scenes": {
                            "scene_1": {
                                "score": 100,
                                "stars": 5,
                                "state": "state_1"
                            },
                            "scene_3": {
                                "score": 0,
                                "stars": 0,
                                "state": "default"
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "scene_order": ["scene_3", "scene_1", "scene_2"],
                "scenes": {
                    "scene_1": {
                        "name": "scene_1.name",
                        "unlock_text": "scene_1.lock_text",
                        "unlock_star": 1,
                        "type": "hog",
                        "path": "hog_penthouse",
                        "img": "hog_penthouse/thumb.png",
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
                        "name": "scene_2.name",
                        "unlock_text": "scene_2.lock_text",
                        "unlock_star": 2,
                        "type": "ho_puzzle",
                        "path": "hog_penthouse",
                        "img": "hog_penthouse/thumb.png",
                        "items": {
                            "item_1": {}
                        },
                        "states": {
                            "default": {},
                            "state_1": {
                                "items": ["item_1"]
                            }
                        }
                    },
                    "scene_3": {
                        "name": "scene_3.name",
                        "unlock_text": "scene_3.lock_text",
                        "unlock_star": 3,
                        "type": "hog",
                        "path": "hog_penthouse",
                        "img": "hog_penthouse/thumb.png",
                        "items": {
                            "item_4": {},
                            "item_5": {},
                            "item_6": {}
                        },
                        "states": {
                            "default": {},
                            "state_1": {
                                "items": ["item_4", "item_5"]
                            },
                            "state_2": {
                                "items": ["item_6"]
                            }
                        }
                    }
                }
            });
        });

        it('should return ordered list of scene_info objects', function() {
            this.QA.handle().should.deep.equal([
                {
                    visible: true,
                    haveItemsToFind: false,
                    isBonus: false,
                    isNew: true,
                    name: 'scene_3',
                    title: 'scene_3.name',
                    pic: 'hog_penthouse/thumb.png',
                    type: 'hog',
                    path: 'hog_penthouse',
                    lockText: 'scene_3.lock_text',
                    openStars: 3,
                    scores: 0,
                    nextStarScore: 100000,
                    stars: 0,
                    energyCost: 20
                }, {
                    visible: true,
                    haveItemsToFind: true,
                    isBonus: false,
                    isNew: false,
                    name: 'scene_1',
                    title: 'scene_1.name',
                    pic: 'hog_penthouse/thumb.png',
                    type: 'hog',
                    path: 'hog_penthouse',
                    lockText: 'scene_1.lock_text',
                    openStars: 1,
                    scores: 100,
                    nextStarScore: 0,
                    stars: 5,
                    energyCost: 5
                }, {
                    visible: false,
                    haveItemsToFind: false,
                    isBonus: true,
                    isNew: false,
                    name: 'scene_2',
                    title: 'scene_2.name',
                    pic: 'hog_penthouse/thumb.png',
                    type: 'ho_puzzle',
                    path: 'hog_penthouse',
                    lockText: 'scene_2.lock_text',
                    openStars: 2,
                    scores: 0,
                    nextStarScore: 100000,
                    stars: 0,
                    energyCost: 20
                }
            ]);
        });
    });
});
