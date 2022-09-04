var helper = require('./../../helper');
eval(helper.initContextCode());

describe("IncludeCaseTasks", function() {
    subject("command", function() {
        return new IncludeCaseTasksCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "status": "open",
                    "tasks": [],
                    "medals": ["silver"],
                    "stars": 3,
                    "opened_scenes": {
                        "scene_1": {
                            "stars": 5
                        },
                        "scene_2": {
                            "stars": 5
                        }
                    },
                    "found_forensic_items": {
                        "fingerprints": {
                            "state": "state_2"
                        }
                    }
                }
            }
        });

        helper.sandbox.stub(definitions.cases.case_01, "scenes", {
            "scene_1": {},
            "scene_2": {}
        });
    });

    describe("#execute", function() {
        describe('when have no stars to collect', function() {
            it("should add all buy_item tasks", function() {
                this.command.execute();
                context.case.tasks().length.should.be.equals(3);
            });
        });


        it("should add two tasks", function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "status": "open",
                        "tasks": [],
                        "medals": ["silver"],
                        "stars": 0,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 4
                            },
                            "scene_2": {
                                "stars": 5
                            }
                        },
                        "found_forensic_items": {
                            "fingerprints": {
                                "state": "state_2"
                            }
                        }
                    }
                }
            });
            this.command.execute();
            context.case.tasks().length.should.be.equals(2);
        });


        it("should add three tasks", function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "status": "open",
                        "tasks": [],
                        "medals": ["silver"],
                        "stars": 0,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 4
                            },
                            "scene_2": {
                                "stars": 4
                            }
                        },
                        "found_forensic_items": {
                            "fingerprints": {
                                "state": "state_2"
                            }
                        }
                    }
                }
            });
            this.command.execute();
            context.case.tasks().length.should.be.equals(3);
        });

        it("should add one task if gold medal awarded", function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "status": "complete",
                        "tasks": [],
                        "medals": ["gold"],
                        "stars": 7,
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 5
                            },
                            "scene_2": {
                                "stars": 5
                            }
                        },
                        "found_forensic_items": {
                            "fingerprints": {
                                "state": "state_2"
                            }
                        }
                    }
                }
            });
            this.command.execute();
            context.case.tasks().length.should.be.equals(1);
        });
    });
});
