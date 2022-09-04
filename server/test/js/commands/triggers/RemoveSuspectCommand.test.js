var helper = require('./../../helper');
eval(helper.initContextCode());

describe('RemoveSuspectCommand', function() {
    subject('command', function() {
        return new RemoveSuspectCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_suspects": {
                        "tyler": {}
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "suspects", {
            "tyler": {}
        })
    });

    describe('#execute', function() {
        it('should remove suspect from active case', function() {
            this.command.execute("tyler");
            context.case.knownSuspects().should.deep.equal({});
        })
    });
});

