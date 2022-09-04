var helper = require('./../../helper');
eval(helper.initContextCode());

describe('CheckTransitionCommand', function() {

    subject('command', function() {
        return new CheckTransitionCommand();
    });
    var some_triggers = [{"trigger_name": "value"}]

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "triggers": {}
            },
            "open_cases": {
                "case_01": {
                    "found_forensic_items": {
                        "forensic_item_1": {"state": "state_1"},
                        "forensic_item_2": {"state": "state_2"}
                    },
                    "found_lab_items": {
                        "lab_item_1": {"state": "state_1"},
                        "lab_item_2": {"state": "state_2"}
                    },
                    "known_suspects": {
                        "suspect_1": {"state": "state_1"},
                        "suspect_2": {"state": "state_2"},
                        "suspect_3": {"state": "state_1", "talked": true}
                    },
                    "opened_scenes": {
                        "scene_1": {"state": "state_1"},
                        "scene_2": {"state": "state_2"}
                    },
                    "performed_transitions": [],
                    "performed_custom_tasks": ["custom_1"],
                    "tasks": []
                }
            }
        });
        helper.sandbox.stub(definitions.cases, "case_01", {
            "forensic_items": {
                "forensic_item_1": {},
                "forensic_item_2": {}
            },
            "lab_items": {
                "lab_item_1": {},
                "lab_item_2": {}
            },
            "suspects": {
                "suspect_1": {},
                "suspect_2": {},
                "suspect_3": {}
            },
            "scenes": {
                "scene_1": {},
                "scene_2": {}
            },
            "custom_tasks": {
                "custom_1": {},
                "custom_2": {}
            },
            "transitions": {
                "forensic_item_state_transition": {
                    "preconditions": [
                        {"forensic_item_state": {"forensic_item_1": "state_1"}}
                    ],
                    "on_complete": some_triggers
                },
                "lab_item_state_transition": {
                    "preconditions": [
                        {"lab_item_state": {"lab_item_1": "state_1"}}
                    ],
                    "on_complete": some_triggers
                },
                "suspect_state_transition": {
                    "preconditions": [
                        {"suspect_state": {"suspect_1": "state_1"}}
                    ],
                    "on_complete": some_triggers
                },
                "suspect_state_talked_transition": {
                    "preconditions": [
                        {"suspect_state_talked": {"suspect_3": "state_1"}}
                    ],
                    "on_complete": some_triggers
                },
                "scene_state_transition": {
                    "preconditions": [
                        {"scene_state": {"scene_1": "state_1"}}
                    ],
                    "on_complete": some_triggers
                },
                "custom_task_transition": {
                    "preconditions": [
                        {"custom_task_completed": "custom_1"}
                    ],
                    "on_complete": some_triggers
                },
                "combinated_transition": {
                    "preconditions": [
                        {"suspect_state": {"suspect_1": "state_1"}},
                        {"lab_item_state": {"lab_item_1": "state_1"}},
                        {"forensic_item_state": {"forensic_item_1": "state_1"}},
                        {"scene_state": {"scene_1": "state_1"}}
                    ],
                    "on_complete": some_triggers
                },
                "failing_transition": {
                    "preconditions": [
                        {"suspect_state": {"suspect_1": "state_2"}},
                        {"lab_item_state": {"lab_item_1": "state_3"}},
                        {"suspect_state": {"suspect_1": "state_1"}},
                    ],
                    "on_complete": some_triggers
                }
            }
        })
    });

    describe('#execute', function() {
        it('adds triggers on completing successful transition', function() {
            this.command.execute("combinated_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('checks forensic_item_state precondition', function() {
            this.command.execute("forensic_item_state_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('checks lab_item_state precondition', function() {
            this.command.execute("lab_item_state_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('checks suspect_state precondition', function() {
            this.command.execute("suspect_state_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('checks suspect_state_talked precondition', function() {
            this.command.execute("suspect_state_talked_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('checks scene_state precondition', function() {
            this.command.execute("scene_state_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('checks custom_task precondition', function() {
            this.command.execute("custom_task_transition");
            context.case.triggers().should.deep.equal(some_triggers);
        });

        it('adds transition to performed transitions list', function() {
            this.command.execute("combinated_transition");
            context.case.performedTransitions().should.deep.equal(["combinated_transition"]);
        });

        it('performs transition only once', function() {
            this.executor = helper.sandbox.stub(Executor,"run");
            this.command.execute("combinated_transition");
            this.command.execute("combinated_transition");
            this.executor.should.have.been.calledOnce;
        });
    });
});

