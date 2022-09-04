var helper = require('./../helper');
eval(helper.initContextCode());

describe('ActiveSceneInfoQA', function() {
    subject('QA', function() {
        return ActiveSceneInfoQA;
    });

    describe("#handle", function() {
        it("should return active_scene_info object for hog scene", function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1"
                    }
                },
                "open_cases": {
                    "case_01": {
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 2
                            }
                        }
                    }
                }
            });

            helper.sandbox.stub(definitions.cases, "case_01", {
                "scenes": {
                    "scene_1": {
                        "type": "hog"
                    }
                }
            });

            this.QA.handle().should.deep.equals({
                "ScoreForMult": [
                    25000,
                    30000,
                    35000,
                    40000,
                    50000,
                    60000
                ],
                "timeLimit": 0,
                "itemCount": 9,
                "starScores": [
                    100000,
                    200000,
                    300000,
                    400000,
                    500000
                ],
                "gridWidth": 0,
                "gridHeight": 0,
                "ScoresComboMultiplierMin": 1,
                "ScoresComboMultiplierMax": 6,
                "ScoresComboMultiplierFadeTime": 3,
                "ScoresComboMultiplierIncrement": 1,
                "HogMissClickPenalityTime": 3,
                "HogMissClickPenalityCount": 3,
                "HogMissClickPenality": 3,
                "HogHintReloadTime": 20,
                "HogHintReloadCount": 1,
                "TimeMaxBonus": 300000,
                "ScorePerHint": 20000,
                "HintMaxCount": 5
            });
        });

        it("should return active_scene_info object for puzzle scene", function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1"
                    }
                },
                "open_cases": {
                    "case_01": {
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 2
                            }
                        }
                    }
                }
            });

            helper.sandbox.stub(definitions.cases, "case_01", {
                "scenes": {
                    "scene_1": {
                        "type": "puzzle"
                    }
                }
            });

            this.QA.handle().should.deep.equals({
                "ScoreForMult": [
                    25000,
                    30000,
                    35000,
                    40000,
                    50000,
                    60000
                ],
                "timeLimit": 0,
                "itemCount": 9,
                "starScores": [
                    100000,
                    200000,
                    300000,
                    400000,
                    500000
                ],
                "gridWidth": 8,
                "gridHeight": 6,
                "ScoresComboMultiplierMin": 1,
                "ScoresComboMultiplierMax": 6,
                "ScoresComboMultiplierFadeTime": 3,
                "ScoresComboMultiplierIncrement": 1,
                "HogMissClickPenalityTime": 3,
                "HogMissClickPenalityCount": 3,
                "HogMissClickPenality": 3,
                "HogHintReloadTime": 20,
                "HogHintReloadCount": 1,
                "TimeMaxBonus": 300000,
                "ScorePerHint": 20000,
                "HintMaxCount": 5
            });
        });

        it("should return active_scene_info object for timed hog", function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1"
                    }
                },
                "open_cases": {
                    "case_01": {
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 2
                            }
                        }
                    }
                }
            });

            helper.sandbox.stub(definitions.cases, "case_01", {
                "scenes": {
                    "scene_1": {
                        "type": "hogTime"
                    }
                }
            });

            this.QA.handle().should.deep.equals({
                "ScoreForMult": [
                    5500,
                    7500,
                    9500,
                    11500,
                    13500,
                    15500
                ],
                "timeLimit": 50,
                "itemCount": 60,
                "starScores": [
                    100000,
                    200000,
                    300000,
                    400000,
                    500000
                ],
                "gridWidth": 0,
                "gridHeight": 0,
                "ScoresComboMultiplierMin": 1,
                "ScoresComboMultiplierMax": 6,
                "ScoresComboMultiplierFadeTime": 3,
                "ScoresComboMultiplierIncrement": 1,
                "HogMissClickPenalityTime": 3,
                "HogMissClickPenalityCount": 3,
                "HogMissClickPenality": 3,
                "HogHintReloadTime": 20,
                "HogHintReloadCount": 1,
                "TimeMaxBonus": 300000,
                "ScorePerHint": 20000,
                "HintMaxCount": 5
            });
        });
    });
});
