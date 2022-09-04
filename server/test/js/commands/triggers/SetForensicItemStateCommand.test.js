var helper = require('./../../helper');
eval(helper.initContextCode());

describe('SetForensicItemStateCommand', function() {
    subject('command', function() {
        return new SetForensicItemStateCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor,"run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "found_forensic_items": {
                        "fingerprints": {
                            "state": "state_2"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "forensic_items", {
            "fingerprints": {
                "states": {
                    "state_1": {},
                    "state_2": {
                        "minigame": {}
                    }
                }
            }
        })
    });

    describe('#execute', function() {
        it('should change forensic item state in active case', function() {
            this.command.execute({"forensic_item": "fingerprints", "state": "state_1"});
            context.case.foundForensicItems("fingerprints").state.should.equal("state_1");
        });

        it('should create task if new state contains minigame', function() {
            this.command.execute({"forensic_item": "fingerprints", "state": "state_2"});
            this.executor.should.have.been.calledWith(PushTaskCommand, {"type": "examine", "object_id": "fingerprints"});
        });

        it('should not create task if new state does not contains minigame', function() {
            this.command.execute({"forensic_item": "fingerprints", "state": "state_1"});
            this.executor.should.not.have.been.calledWith(PushTaskCommand, {"type": "examine", "object_id": "fingerprints"});
        });
    });
});

