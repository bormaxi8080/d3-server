var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddLabItemCommand', function() {
    subject('command', function() {
        return new AddLabItemCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "found_lab_items": {}
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "lab_items", {
            "body": {}
        })
    });

    describe('#execute', function() {
        it('should add lab item to active case', function() {
            this.command.execute("body");
            context.case.foundLabItems("body").should.deep.equal({state: "new", index: 0});
        });

        it('should add analyze task', function() {
            this.command.execute("body");
            this.executor.should.be.calledWith(PushTaskCommand, {"type": "analyze", "object_id": "body"});
        });
    });
});

