var helper = require('./../helper');
eval(helper.initContextCode());

describe('ArrestSuspectCommand', function() {
    subject('command', function() {
        return new ArrestSuspectCommand();
    });

    var trigger_init = {"trigger_init": "value_1"}
    var trigger_success = {"trigger_success": "value_2"}
    var trigger_fail = {"trigger_fail": "value_3"}

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "triggers": {
                    "case_01": [trigger_init]
                }
            },
            "open_cases": {
                "case_01": {
                    "mistaken_arrests" : 2,
                    "known_suspects": {
                        "suspect_1": {
                            "state": "arrest"
                        },
                        "suspect_2": {
                            "state": "arrest"
                        },
                        "suspect_3": {
                            "state": "default"
                        },
                        "suspect_4": {
                            "state": "interrogation_1"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases, "case_01", {
            "suspects": {
                "suspect_1": {},
                "suspect_2": {},
                "suspect_3": {},
                "suspect_3": {
                    "states": {
                        "interrogation_1": {}
                    }
                }
            },
            "arrest": {
                "killer": "suspect_1",
                "on_success": [trigger_success],
                "on_fail": [trigger_fail]
            }
        });
        this.executor = helper.sandbox.stub(Executor,"run");
    });

    describe('#execute', function() {
        it('should throw LogicError on incorrect user state', function() {
            var self = this;
            (function() {
                self.command.execute({suspect: "suspect_4"});
            }).should.throw(LogicError);
        });

        it('should throw LogicError on default user state', function() {
            var self = this;
            (function() {
                self.command.execute({suspect: "suspect_3"});
            }).should.throw(LogicError);
        });

        it('should consume stars', function() {
            var arrest_cost = context.case.suspectClickCost("suspect_2");
            this.command.execute({suspect: "suspect_2"});
            this.executor.should.have.been.calledWith(ConsumeStarCommand, arrest_cost);
        });

        describe('on correct killer guess', function() {
            beforeEach(function() {
                this.command.execute({suspect: "suspect_1"});
            });

            it('should set all suspects state to default', function() {
                this.executor.should.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_1", "state": "default"});
                this.executor.should.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_2", "state": "default"});
                this.executor.should.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_3", "state": "default"});
                this.executor.should.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_4", "state": "default"});
            });

            it('should push success triggers', function() {
                this.executor.should.have.been.calledWith(PushTriggersCommand, [trigger_success]);
            });

            it('should delete arrest task', function() {
                this.executor.should.have.been.calledWith(DeleteTasksCommand, "arrest", null);
            });
        });

        describe('on incorrect killer guess', function() {
            beforeEach(function() {
                this.command.execute({suspect: "suspect_2"});
            });

            it('should set suggest susspect state to default', function() {
                this.executor.should.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_2", "state": "default"});
                this.executor.should.not.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_1", "state": "default"});
                this.executor.should.not.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_3", "state": "default"});
                this.executor.should.not.have.been.calledWith(SetSuspectStateCommand, {"suspect": "suspect_4", "state": "default"});
            });

            it('should push success triggers', function() {
                this.executor.should.have.been.calledWith(PushTriggersCommand, [trigger_fail]);
            });

            it('should increase mistaken arrests count', function() {
                context.case.mistakenArrestsCount("case_01").should.equal(3);
            });
        });

    });
});

