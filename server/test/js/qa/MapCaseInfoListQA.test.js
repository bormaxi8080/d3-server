var helper = require('./../helper');
eval(helper.initContextCode());

describe('MapCaseInfoListQA', function() {
    subject('QA', function() {
        return MapCaseInfoListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": { "active_case": "case_02" },
                "new_cases": {
                    "case_03": {}
                },
                "unlocked_cases": ["case_02"],
                "open_cases": {
                    "case_01": {
                        "medals": ["bronze", "silver"],
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 3
                            },
                            "scene_2": {
                                "stars": 5
                            },
                            "scene_3": {
                                "stars": 2
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions, "cases", {
                "case_01": {
                    "scenes": {
                        "scene_1": {},
                        "scene_2": {},
                        "scene_3": {}
                    }
                },
                "case_02": {
                    "scenes": {
                        "scene_1": {},
                        "scene_2": {},
                        "scene_3": {},
                        "scene_4": {},
                        "scene_5": {},
                        "scene_6": {}
                    }
                },
                "case_03": {
                    "scenes": {
                        "scene_1": {}
                    }
                }
            });
            helper.sandbox.stub(definitions, "map", {
                "case_order": ["case_01", "case_02", "case_03"],
                "descriptions": {
                    "case_01": {
                        "name": "case_01",
                        "desc": "case_01_desc",
                        "path": "path/case_01",
                        "img": "path/case_01/img"
                    },
                    "case_02": {
                        "name": "case_02",
                        "desc": "case_02_desc",
                        "path": "path/case_02",
                        "img": "path/case_02/img"
                    },
                    "case_03": {
                        "name": "case_03",
                        "desc": "case_03_desc",
                        "path": "path/case_03",
                        "img": "path/case_03/img"
                    }
                }
            });
        });

        it('should return ordered list of map_case_info objects', function() {
            this.QA.handle().should.deep.equal([{
                state: 'opened',
                requires_unlock: false,
                id: 'case_01',
                current: false,
                starsEarned: 10,
                starsTotal: 15,
                medals: [ 'bronze', 'silver' ],
                text1: 'case_01',
                text2: 'case_01_desc',
                path: 'path/case_01',
                img: 'path/case_01/img'
            }, {
                state: 'unlocked',
                requires_unlock: false,
                id: 'case_02',
                current: true,
                starsEarned: 0,
                starsTotal: 30,
                medals: [],
                text1: 'case_02',
                text2: 'case_02_desc',
                path: 'path/case_02',
                img: 'path/case_02/img'
            }, {
                state: 'new',
                requires_unlock: true,
                id: 'case_03',
                current: false,
                starsEarned: 0,
                starsTotal: 5,
                medals: [],
                text1: 'case_03',
                text2: 'case_03_desc',
                path: 'path/case_03',
                img: 'path/case_03/img'
            }]);
        });
    });
});

