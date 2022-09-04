var helper = require('./../../helper');
eval(helper.initContextCode());

describe('UpdateKillerStateCommand', function() {
    subject('command', function() {
        return new UpdateKillerStateCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_clues": ["clue_1", "clue_2"]
                }
            }
        });
        helper.sandbox.stub(definitions.cases, "case_01", {
            "clues": {
                "clue_1": {},
                "clue_2": {},
                "clue_3": {},
                "clue_4": {}
            }
        });
    });

    describe('#execute', function() {
        describe('when clues passed', function() {
            it('updates suspect clues', function() {
                this.command.execute({clues: ["clue_3"]});
                context.case.knownClues().should.deep.equal(["clue_1", "clue_2", "clue_3"]);
            });
        });

        it('throws update_suspect_state event', function() {
            var notify = helper.sandbox.stub(context.events, "notify");
            this.command.execute({
                clues: ["clue_4"],
                text: "some.text.token"
            });
            notify.should.be.calledWith("update_suspect_state", {
                text: "some.text.token",
                clues: {
                    all: ["clue_1", "clue_2", "clue_4"],
                    new: ["clue_4"]
                },
                motive: { value: true, updated: false },
                alibi: { value: false, updated: false }
            })
        });
    });
});

