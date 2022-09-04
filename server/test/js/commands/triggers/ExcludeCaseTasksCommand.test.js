var helper = require('./../../helper');
eval(helper.initContextCode());

describe('ExcludeCaseTasks', function() {
    subject("command", function() {
        return new ExcludeCaseTasksCommand();
    });

    beforeEach(function() {
        helper.sandbox.stub(definitions.cases.case_01, "scenes", {
            "scene_1": {},
            "scene_2": {}
        });
    });

    describe("#execute", function() {
        it("should remove all tasks in current case", function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "tasks": [
                            {
                                "type": "buy_booster",
                                "object_id": "quick_lookup"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "full_hints"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "full_multiplier"
                            },
                            {
                                "type": "earn_stars",
                                "object_id": "default"
                            }
                        ],
                        "stars": 0,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 5
                            },
                            "scene_2": {
                                "stars": 5
                            }
                        }
                    }
                }
            });

            this.command.execute();
            context.case.tasks().should.deep.equals([]);
        });

        it("should leave 1 task", function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "tasks": [
                            {
                                "type": "buy_booster",
                                "object_id": "quick_lookup"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "full_hints"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "full_multiplier"
                            },
                            {
                                "type": "earn_stars",
                                "object_id": "default"
                            }
                        ],
                        "stars": 1,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 5
                            },
                            "scene_2": {
                                "stars": 5
                            }
                        }
                    }
                }
            });
            this.command.execute();
            context.case.tasks().length.should.be.equal(1);
        });

        it("should leave 2 tasks", function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},

                "open_cases": {
                    "case_01": {
                        "status": "auxiliary_complete",
                        "tasks": [
                            {
                                "type": "buy_booster",
                                "object_id": "quick_lookup"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "full_hints"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "full_multiplier"
                            },
                            {
                                "type": "earn_stars",
                                "object_id": "default"
                            }
                        ],
                        "stars": 2,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 5
                            },
                            "scene_2": {
                                "stars": 5
                            }
                        }
                    }
                }
            });
            this.command.execute();
            context.case.tasks().length.should.be.equal(2);
        });

        it("should remove earn_stars task", function() {
                helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},

                "open_cases": {
                    "case_01": {
                        "status": "auxiliary_complete",
                        "tasks": [
                            {
                                "type": "buy_booster",
                                "object_id": "item_1"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "item_2"
                            },
                            {
                                "type": "buy_booster",
                                "object_id": "item_3"
                            },
                            {
                                "type": "earn_stars",
                                "object_id": "default"
                            }
                        ],
                        "stars": 3,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 5
                            },
                            "scene_2": {
                                "stars": 5
                            }
                        }
                    }
                }
            });
            this.command.execute();
            context.case.tasks().length.should.be.equal(3);
        });
    });
});
