var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddCluesCommand', function() {
    subject('command', function() {
        return new AddCluesCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_clues": ["height"]
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "clues", {
            "height": {},
            "width": {}
        })
    });

    describe('#execute', function() {
        it('should add clue to active case', function() {
            this.command.execute({clues: ["width"]});
            context.case.isClueKnown("width").should.be.true;
        })
    });
});

