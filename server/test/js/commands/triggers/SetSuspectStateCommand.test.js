var helper = require('./../../helper');
eval(helper.initContextCode());

describe('SetSuspectStateCommand', function() {
    subject('command', function() {
        return new SetSuspectStateCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor,"run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_suspects": {
                        "tyler": {
                            "state": "state_2"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "suspects", {
            "tyler": {
                "states": {
                    "state_1": {},
                    "state_2": {},
                    "state_3": {
                        "talkable": false
                    }
                }
            }
        });
    });

    describe('#execute', function() {
        it('should change suspect state in active case', function() {
            this.command.execute({"suspect": "tyler", "state": "state_1"});
            context.case.knownSuspects("tyler").state.should.equal("state_1");
        });

        it('should reset suspect talked flag to false', function() {
            this.command.execute({"suspect": "tyler", "state": "state_1"});
            context.case.knownSuspects("tyler").talked.should.equal(false);
        });

        it('should add talk task on non-default state', function() {
            this.command.execute({"suspect": "tyler", "state": "state_1"});
            this.executor.should.have.been.calledWith(PushTaskCommand, {"type": "talk", "object_id": "tyler"});
        });

        it('should delete talk task on default state', function() {
            this.command.execute({"suspect": "tyler", "state": "default"});
            this.executor.should.have.been.calledWith(DeleteTasksCommand, "talk", "tyler");
        });

        it('should not add talk task on non-default state if talkable flag set to false', function() {
            this.command.execute({"suspect": "tyler", "state": "state_3"});
            this.executor.should.not.have.been.calledWith(PushTaskCommand, {"type": "talk", "object_id": "tyler"});
        });

    });
});

