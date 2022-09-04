var helper = require('./../helper');
eval(helper.initContextCode());

describe('EndCaseCommand', function() {
    subject('command', function() {
        return new EndCaseCommand();
    });


    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": { "active_case": "case_01"},
            "options": {},
            "open_cases": {
                "case_01": {
                    "tasks": {}
                }
            }
        });
    });

    describe('#execute', function() {
        it('should include additional case tasks', function() {
            this.command.execute();
            this.executor.should.be.calledWith(IncludeCaseTasksCommand);
        });
    });
});

