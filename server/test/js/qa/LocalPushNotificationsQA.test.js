var helper = require('./../helper');
eval(helper.initContextCode());

describe('LocalPushNotificationsQA', function() {
    subject('QA', function() {
        return LocalPushNotificationsQA;
    });

    var time = Date.now();

    describe('.handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "player": {
                    "energy": {
                        "current": 10,
                        "increment_time": time + 100 * 1000
                    }
                },
                "immediate_data": {
                    "active_case": "case_01",
                    "analyzed_items": {
                        "case_01": {
                            "body": {
                                "end": time + 1000 * 1000
                            }
                        }
                    }
                },
                "open_cases": {
                    "case_01": {
                        "tasks": [{
                          "type": "analyze",
                          "object_id": "body"
                        },{
                          "type": "investigate",
                          "object_id": "scene_1"
                        }],
                        "found_lab_items": {
                            "body": {
                                "state": "analyzing"
                            }
                        },
                        "opened_scenes": {
                            "scene_1": {
                                "stars": 3,
                                "state": "1"
                            }
                        }
                    }
                }
            });
        });

        it('returns returns array of push notification with left time', function() {
            this.QA.handle(time).should.deep.equal([{
                "text": "interface.local_push_notifications.full_energy",
                "time": 17920
            }, {
                "text": "interface.local_push_notifications.can_investigate",
                "time": 1720
            }, {
                "text": "interface.local_push_notifications.analyze_done",
                "time": 1000
            }]);
        });
    });

    describe('.analyze_done', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "analyzed_items": {
                        "case_01": {
                            "lab_item_1": {
                                "end": time + 1000
                            },
                            "lab_item_2": {
                                "end": time - 1000
                            }
                        },
                        "case_04": {
                            "lab_item_1": {
                                "end": time + 1000000
                            }
                        }
                    }
                }
            });
        });

        it('returns list of analyze events', function() {
            this.QA.analyze_done().should.deep.equal([{
                time: time + 1000,
                text: "interface.local_push_notifications.analyze_done"
            }, {
                time: time - 1000,
                text: "interface.local_push_notifications.analyze_done"
            }, {
                time: time + 1000000,
                text: "interface.local_push_notifications.analyze_done"
            }])
        });
    });

    describe('.min_investigate_cost', function() {
        describe('without active investigate tasks', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "open_cases": {
                        "case_01": {
                            "tasks": [{
                              "type": "analyze",
                              "object_id": "lab_item_1"
                            }]
                        }
                    }
                });
            });

            it('returns 0', function() {
                this.QA.min_investigate_cost().should.equal(0);
            });
        });

        describe('with active investigate stasks', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "open_cases": {
                        "case_01": {
                            "tasks": [{
                              "type": "investigate",
                              "object_id": "scene_1"
                            }, {
                              "type": "analyze",
                              "object_id": "scene_2"
                            }]
                        },
                        "case_02": {
                            "tasks": [{
                              "type": "investigate",
                              "object_id": "scene_3"
                            }]
                        }
                    }
                });
                helper.sandbox.stub(context.case, "sceneEnergyCost", function(scene_id, case_id) {
                    if (case_id === "case_02") {
                        return 5;
                    } else {
                        return 20;
                    }
                });
            });

            it('returns minimal scene investigation cost', function() {
                this.QA.min_investigate_cost().should.equal(5);
            });

        });
    });
});
