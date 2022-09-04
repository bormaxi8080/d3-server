var helper = require('./../../helper');
eval(helper.initContextCode());

describe('InitArrestStateCommand', function() {
    subject('command', function() {
        return new InitArrestStateCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor,"run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_suspects": {
                        "tyler": {},
                        "dyson": {}
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "suspects", {
            "tyler": {},
            "dyson": {}
        });
    });

    describe('#execute', function() {
        it('should change all suspects state to arrest', function() {
            this.command.execute();
            context.case.knownSuspects("tyler").state.should.equal("arrest");
            context.case.knownSuspects("dyson").state.should.equal("arrest");
        });

        it('should delete all talk tasks', function() {
            this.command.execute();
            this.executor.should.have.been.calledWith(DeleteTasksCommand, "talk", null);
        });

        it('should add arrest task', function() {
            this.command.execute();
            this.executor.should.have.been.calledWith(PushTaskCommand, {"type": "arrest", "object_id": "arrest"});
        });
    });
});

