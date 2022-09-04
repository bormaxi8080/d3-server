var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddSuspectCluesCommand', function() {
    subject('command', function() {
        return new AddSuspectCluesCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_suspects": {
                        "tyler": {
                            "clues": ["clue_1"]
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "suspects", {
            "tyler": {
                "clues": {
                    "clue_1": {},
                    "clue_2": {},
                    "clue_3": {},
                    "clue_4": {}
                }
            }
        })
    });

    describe('#execute', function() {
        it('should add suspect clues', function() {
            this.command.execute({"suspect": "tyler", "clues":["clue_2", "clue_4"]});
            context.case.knownSuspects("tyler").clues.should.deep.equal(['clue_1', 'clue_2', 'clue_4'])
        })
    });
});

