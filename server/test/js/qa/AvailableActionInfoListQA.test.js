var helper = require('./../helper');
eval(helper.initContextCode());

describe('AvailableActionInfoListQA', function() {
    subject('QA', function() {
        return AvailableActionInfoListQA;
    });

    describe('#handle', function() {
        describe('with analyze tasks', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01",
                        "analyzed_items": {
                            "case_01": {
                                "lab_item_1": {
                                    "end": 1000000
                                },
                                "lab_item_2": {
                                    "end": 2200000
                                }
                            }
                        }
                    },
                    "open_cases": {
                        "case_01": {
                            "found_lab_items": {
                                "lab_item_1": {
                                    "state": "analyzing",
                                    "index": 2
                                },
                                "lab_item_2": {
                                    "state": "analyzing",
                                    "index": 1
                                },
                                "lab_item_3": {
                                    "state": "new",
                                    "index": 3
                                }
                            },
                            "tasks": [{
                                "type": "analyze",
                                "object_id": "lab_item_1"
                            }, {
                                "type": "analyze",
                                "object_id": "lab_item_2"
                            }, {
                                "type": "analyze",
                                "object_id": "lab_item_3"
                            }]
                        }
                    }
                });

                helper.sandbox.stub(definitions.cases, "case_01", {
                    "lab_items": {
                        "lab_item_1": {
                            "name": "lab_item_1.name",
                            "img": "lab_item_1.img",
                            "analyze_time": 100
                        },
                        "lab_item_2": {
                            "name": "lab_item_2.name",
                            "img": "lab_item_2.img",
                            "analyze_time": 2000
                        },
                        "lab_item_3": {
                            "name": "lab_item_3.name",
                            "img": "lab_item_3.img",
                            "analyze_time": 100
                        }
                    }
                });
            });

            it('should return available_action_info objects', function() {
                this.QA.handle(1000000).should.deep.equal([{
                    type: 'eToLab',
                    cost: '',
                    index: 0,
                    starCost: 0,
                    name: 'lab_item_1',
                    img: 'lab_item_1.img',
                    actionText: 'tasks.analyzed.action_text',
                    targetText: 'tasks.analyzed.target_text',
                    costText: 'interface.tablet.cost_text.lab_analyzed',
                    imageTip: '',
                    completeness: 1
                }, {
                    type: 'eToLab',
                    cost: '4$',
                    index: 1,
                    starCost: 0,
                    name: 'lab_item_2',
                    img: 'lab_item_2.img',
                    actionText: 'tasks.analyze.action_text',
                    targetText: 'lab_item_2.name',
                    costText: 'interface.tablet.cost_text.lab_speedup',
                    imageTip: '00:20:00',
                    completeness: 0.4
                }, {
                    type: 'eToLab',
                    cost: '00:01:40&',
                    index: 2,
                    starCost: 0,
                    name: 'lab_item_3',
                    img: 'lab_item_3.img',
                    actionText: 'tasks.analyze.action_text',
                    targetText: 'lab_item_3.name',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    completeness: 1
                }]);
            });
        });

        describe('with examine task', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "found_forensic_items": {
                                "forensic_item_1": {
                                    "state": "state_1"
                                },
                                "forensic_item_2": {
                                    "state": "state_1"
                                },
                                "forensic_item_3": {
                                    "state": "state_2"
                                }
                            },
                            "tasks": [{
                                "type": "examine",
                                "object_id": "forensic_item_1"
                            },{
                                "type": "examine",
                                "object_id": "forensic_item_2"
                            },{
                                "type": "examine",
                                "object_id": "forensic_item_3"
                            }]
                        }
                    }
                });

                helper.sandbox.stub(definitions.cases, "case_01", {
                    "forensic_items": {
                        "forensic_item_1": {
                            "name": "forensic_item_1.name",
                            "states": {
                                "state_1": {
                                    "img": "forensic_item_1.img",
                                    "minigame": {
                                    }
                                }
                            }
                        },
                        "forensic_item_2": {
                            "name": "forensic_item_2.name",
                            "target_text": "forensic_item_2.target_text",
                            "states": {
                                "state_1": {
                                    "img": "forensic_item_2.img",
                                    "minigame": {
                                        "cost": 0
                                    }
                                }
                            }
                        },
                        "forensic_item_3": {
                            "states": {
                                "state_2": {
                                    "img": "forensic_item_3.img",
                                    "target_text": "forensic_item_3.state_2.target_text",
                                    "minigame": {
                                        "cost": 0
                                    }
                                }
                            }
                        }
                    }
                });
            });

            it('should return available_action_info objects', function() {
                this.QA.handle(1000000).should.deep.equal([{
                    type: 'eToClues',
                    cost: '1*',
                    index: 0,
                    starCost: 1,
                    name: 'forensic_item_1',
                    img: 'forensic_item_1.img',
                    actionText: 'tasks.examine.action_text',
                    targetText: 'forensic_item_1.name',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    completeness: 1
                }, {
                    type: 'eToClues',
                    cost: '',
                    index: 1,
                    starCost: 0,
                    name: 'forensic_item_2',
                    img: 'forensic_item_2.img',
                    actionText: 'tasks.examine.action_text',
                    targetText: 'forensic_item_2.target_text',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    completeness: 1
                }, {
                    type: 'eToClues',
                    cost: '',
                    index: 2,
                    starCost: 0,
                    name: 'forensic_item_3',
                    img: 'forensic_item_3.img',
                    actionText: 'tasks.examine.action_text',
                    targetText: 'forensic_item_3.state_2.target_text',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    completeness: 1
                }]);
            });
        });

        describe('with talk task', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "known_suspects": {
                                "suspect_1": {
                                    "state": "dialog_1"
                                },
                                "suspect_2": {
                                    "state": "dialog_1"
                                }
                            },
                            "tasks": [{
                                "type": "talk",
                                "object_id": "suspect_1"
                            },{
                                "type": "talk",
                                "object_id": "suspect_2"
                            }]
                        }
                    }
                });

                helper.sandbox.stub(definitions.cases, "case_01", {
                    "suspects": {
                        "suspect_1": {
                            "states": {
                                "default": {
                                    "img": "suspect_1.img",
                                    "title": "suspect_1.default.title",
                                    "target_text": "suspect_1.default.target_text",
                                    "status": "suspect_1.default.status",
                                    "prop_1": "suspect_1.default.prop_1",
                                    "prop_2": "suspect_1.default.prop_2"
                                },
                                "dialog_1": {
                                }
                            }
                        },
                        "suspect_2": {
                            "states": {
                                "default": {
                                    "img": "suspect_2.img",
                                    "portrait": "suspect_2.portrait",
                                    "title": "suspect_2.default.title",
                                    "target_text": "suspect_2.default.target_text",
                                    "status": "suspect_2.default.status",
                                    "prop_1": "suspect_2.default.prop_1",
                                    "prop_2": "suspect_2.default.prop_2"
                                },
                                "dialog_1": {
                                    "action_text": "suspect_2.dialog_1.action_text"
                                }
                            }
                        }
                    }
                });
            });

            it('should return available_action_info objects', function() {
                this.QA.handle(1000000).should.deep.equal([{
                    type: 'eToSuspects',
                    cost: '1*',
                    index: 0,
                    starCost: 1,
                    name: 'suspect_1',
                    img: 'suspect_1.img',
                    actionText: 'tasks.talk.action_text',
                    targetText: 'suspect_1.default.target_text',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    "completeness": 1
                }, {
                    type: 'eToSuspects',
                    cost: '1*',
                    index: 1,
                    starCost: 1,
                    name: 'suspect_2',
                    img: 'suspect_2.portrait',
                    actionText: 'suspect_2.dialog_1.action_text',
                    targetText: 'suspect_2.default.target_text',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    "completeness": 1
                }]);
            });
        });

        describe('with arrest task', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "known_suspects": {
                                "suspect_1": {
                                    "state": "arrest"
                                }
                            },
                            "tasks": [{
                                "type": "arrest",
                                "object_id": "arrest"
                            }]
                        }
                    }
                });

                helper.sandbox.stub(definitions.cases, "case_01", {
                    "suspects": {
                        "suspect_1": {
                            "states": {
                                "default": {
                                    "img": "suspect_1.img",
                                    "title": "suspect_1.default.title",
                                    "status": "suspect_1.default.status",
                                    "prop_1": "suspect_1.default.prop_1",
                                    "prop_2": "suspect_1.default.prop_2"
                                },
                                "dialog_1": {
                                    "talk_movie": "m7",
                                    "on_talk": []
                                }
                            }
                        }
                    }
                });
            });

            it('should return available_action_info objects', function() {
                this.QA.handle(1000000).should.deep.equal([{
                    type: 'eToSuspects',
                    cost: '1*',
                    index: 0,
                    starCost: 1,
                    name: 'arrest',
                    img: 'images/some_man.png',
                    actionText: 'tasks.arrest.action_text',
                    targetText: 'tasks.arrest.target_text',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    "completeness": 1
                }]);
            });
        });

        describe('with buy_booster task', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "status": "open",
                            "tasks": [
                                {
                                    "type": "buy_booster",
                                    "object_id": "quick_lookup",
                                },
                                {
                                    "type": "buy_booster",
                                    "object_id": "full_hints",
                                }
                            ]
                        }
                    }
                });

                helper.sandbox.stub(definitions.boosters, "booster_types", {
                    "quick_lookup": {
                        "tablet_name": "quick_lookup.name",
                        "tablet_description": "quick_lookup.description",
                        "img": "images/icon_booster_cooldown",
                        "require": {
                            "medal": "silver",
                            "star": 1
                        },
                    },
                    "full_hints": {
                        "tablet_name": "full_hints.name",
                        "tablet_description": "full_hints.description",
                        "img": "images/icon_booster_five",
                        "require": {
                            "star": 2,
                            "medal": "silver"
                        }
                    }
                });
            });

            it('should return available_action_info objects', function() {
                this.QA.handle(1000000).should.deep.equals([{
                    "type": "eCustom",
                    "cost": "1*",
                    "index": 0,
                    "starCost": 1,
                    "name": "quick_lookup",
                    "img": "images/icon_booster_cooldown",
                    "actionText": "quick_lookup.name",
                    "targetText": "quick_lookup.description",
                    "costText": "interface.tablet.cost_text.cost",
                    "imageTip": "",
                    "completeness": 1
                }, {
                    "type": "eCustom",
                    "cost": "2*",
                    "index": 1,
                    "starCost": 2,
                    "name": "full_hints",
                    "img": "images/icon_booster_five",
                    "actionText": "full_hints.name",
                    "targetText": "full_hints.description",
                    "costText": "interface.tablet.cost_text.cost",
                    "imageTip": "",
                    "completeness": 1
                }]);
            });
        });

        describe('with custom task', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "tasks": [{
                                "type": "custom",
                                "object_id": "some_custom_id",
                                "img": "custom.task.img",
                                "action_text": "custom.task.action_text",
                                "target_text": "custom.task.target_text",
                                "cost": 1
                            }]
                        }
                    }
                });

                helper.sandbox.stub(definitions.cases, "case_01", {
                });
            });

            it('should return available_action_info objects', function() {
                this.QA.handle(1000000).should.deep.equal([{
                    type: 'eCustom',
                    cost: '1*',
                    index: 0,
                    starCost: 1,
                    name: 'some_custom_id',
                    img: "custom.task.img",
                    actionText: 'custom.task.action_text',
                    targetText: 'custom.task.target_text',
                    costText: 'interface.tablet.cost_text.cost',
                    imageTip: '',
                    completeness: 1
                }]);
            });
        });
    });
});
