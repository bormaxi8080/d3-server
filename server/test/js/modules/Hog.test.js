var helper = require('./../helper');
eval(helper.initContextCode());

describe('Hog', function() {
    subject('hog', function() {
        return context.hog;
    });

    beforeEach(function() {
        var start_time = 6666666;
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "active_scene": {
                    "scene_id": "scene_1",
                    "start": start_time
                }
            },
            "open_cases": {
                "case_01": {
                    "opened_scenes": {
                        "scene_1": {
                            "stars": 2
                        },
                        "scene_2": {
                            "stars": 3
                        }
                    }
                }
            }
        });

        helper.sandbox.stub(definitions, "case_settings", {
            "stars_per_scene": 5
        });

        helper.sandbox.stub(definitions, "hog_settings", {
            "ScoresComboMultiplierMax":6,
            "ScoreForMult": {
                "hog": [25000, 30000, 35000, 40000, 50000, 60000]
            },
            "ItemsToFind": {
                "hog":[6, 8, 9, 10, 11, 11],
                "hogDiff":[5, 6, 7, 8, 9, 9],
                "puzzle":[6, 8, 9, 10, 11, 11]
            },
            "PuzzleGridSize": [
                {"width":4, "height":6},
                {"width":5, "height":7},
                {"width":6, "height":8},
                {"width":7, "height":9},
                {"width":8, "height":10}
            ],
            "TimeMaxBonus":720000,
            "ScorePerHint":10000,
            "HintMaxCount":5
        });

        helper.sandbox.stub(definitions.cases, "case_01", {
            "score_multiplier": 0.5,
            "scenes": {
                "scene_1": {
                    "score_multiplier": 2.2,
                    "type": "hog"
                },
                "scene_2": {
                    "score_multiplier": 2.0,
                    "type": "puzzle"
                },
                "scene_3": {
                    "score_multiplier": 2.2,
                    "type": "hogDiff"
                },
                "scene_4": {
                    "score_multiplier": 2.2,
                    "type": "hogTime"
                },
                "incorrect_scene": {
                    "score_multiplier": 2.2,
                    "type": "incorrect_type"
                }
            }
        });
    });

    describe('#sceneMaxScore', function() {
        it('should return proper maximum score for coorect hog type', function() {
            context.hog.sceneMaxScore("scene_1").should.equal(1310000);
        });
        it('should return proper maximum score for hog', function() {
            var self = this;
            (function() {
                context.hog.sceneMaxScore("incorrect_scene");
            }).should.throw(LogicError);
        });

    });

    describe('#getFindItemsCount', function() {
        describe('should return proper amount of items to find', function() {
            it('for hog with 0 stars', function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01",
                    },
                    "open_cases": {
                        "case_01": {
                            "opened_scenes": {
                                "scene_1": {
                                    "stars": 0
                                }
                            }
                        }
                    }
                });

                context.hog.getFindItemsCount("scene_1").should.equal(6);
            });
            it('for hog with 2 stars', function() {
                context.hog.getFindItemsCount("scene_1").should.equal(9);
            });
            it('for hog with 5 stars', function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01",
                    },
                    "open_cases": {
                        "case_01": {
                            "opened_scenes": {
                                "scene_1": {
                                    "stars": 5
                                }
                            }
                        }
                    }
                });

                context.hog.getFindItemsCount("scene_1").should.equal(11);
            });
            it('for puzzle', function() {
                context.hog.getFindItemsCount("scene_2").should.equal(10);
            });
            it('for timed hog', function() {
                context.hog.getFindItemsCount("scene_4").should.equal(60);
            });
        });
    });

    describe('#calcExp', function() {
        it('should return proper EXP amount', function() {
            helper.sandbox.stub(definitions, "hog_settings", {
                "ExpAward": [11, 12, 13, 14, 15, 15]
            });
            context.hog.calcExp().should.equal(13);
        });
    });

    describe('#calcCoins', function() {
        it('should return proper Coins amount', function() {
            context.hog.calcCoins(110800).should.equal(11);
        });
    });
});

