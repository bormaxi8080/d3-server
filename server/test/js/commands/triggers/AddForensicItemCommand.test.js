var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddForensicItemCommand', function() {
    subject('command', function() {
        return new AddForensicItemCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor,"run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "found_forensic_items": {}
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "forensic_items", {
            "body": {
                "initial_state": "state_2",
                "states": {
                    "state_1": {},
                    "state_2": {
                        "minigame": {}
                    }
                }
            }
        });
    });

    describe('#execute', function() {
        it('should add forensic item to active case', function() {
            this.command.execute("body");
            context.case.foundForensicItems("body").should.deep.equal({state: "state_2", index: 0});
        });

        it('should create task if initial state contains minigame', function() {
            this.command.execute("body");
            this.executor.should.have.been.calledWith(PushTaskCommand, {"type": "examine", "object_id": "body"});
        });
    });
});

