var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddSuspectCommand', function() {
    subject('command', function() {
        return new AddSuspectCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_suspects": {}
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "suspects", {
            "tyler": {}
        })
    });

    describe('#execute', function() {
        it('should add suspect to active case', function() {
            var expectation = {
                alibi: null,
                motive: null,
                clues: [],
                state: "default",
                talked: false
            }
            this.command.execute("tyler");
            context.case.knownSuspects("tyler").should.deep.equal(expectation);
        })
    });
});

