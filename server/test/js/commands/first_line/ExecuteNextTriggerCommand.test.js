var helper = require('./../../helper');
eval(helper.initContextCode());

describe('ExecuteNextTriggerCommand', function() {
    subject('command', function() {
        return new ExecuteNextTriggerCommand();
    });

    describe('#execute', function() {
        var trigger_1 = {"command_1": "value_1", "command_2": {"hash": "value"}};
        var trigger_2 = {"command_3": "value"};

        beforeEach(function() {
            this.executor = helper.sandbox.stub(Executor,"run");
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "triggers": {
                        "case_01": [
                            trigger_1,
                            trigger_2
                        ]
                    }
                },
                "open_cases": {
                    "case_01": {}
                }
            });
        });

        it('should call trigger commands', function() {
            this.command.execute();
            this.executor.should.be.calledWith("command_1", "value_1");
            this.executor.should.be.calledWith("command_2", {"hash": "value"});
        });

        it('should remove executed trigger', function() {
            this.command.execute();
            this.executor.should.be.calledWith("command_1", "value_1");
            context.case.triggers().should.deep.equal([trigger_2]);
        })

    });
});
