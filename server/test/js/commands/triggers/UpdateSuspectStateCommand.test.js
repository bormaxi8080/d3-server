var helper = require('./../../helper');
eval(helper.initContextCode());

describe('UpdateSuspectStateCommand', function() {
    subject('command', function() {
        return new UpdateSuspectStateCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "known_suspects": {
                        "suspect_1": {
                            "clues": ["clue_1", "clue_2"],
                            "alibi": true,
                            "motive": null
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases, "case_01", {
            "suspects": {
                "suspect_1": {
                    "clues": {
                        "clue_1": {},
                        "clue_2": {},
                        "clue_3": {},
                        "clue_4": {}
                    }
                }
            }
        });
    });

    describe('#execute', function() {
        describe('when alibi passed', function() {
            it('updates suspect alibi', function() {
                this.command.execute({suspect: "suspect_1", alibi: false});
                context.case.knownSuspects("suspect_1").alibi.should.be.false;
            });
        });

        describe('when motive passed', function() {
            it('updates suspect motive', function() {
                this.command.execute({suspect: "suspect_1", motive: true});
                context.case.knownSuspects("suspect_1").motive.should.be.true;
            });
        });

        describe('when clues passed', function() {
            it('updates suspect clues', function() {
                this.command.execute({suspect: "suspect_1", clues: ["clue_3"]});
                context.case.knownSuspects("suspect_1").clues.should.be.deep.equal(["clue_1", "clue_2", "clue_3"]);
            });
        });

        it('throws update_suspect_state event', function() {
            var notify = helper.sandbox.stub(context.events, "notify");
            this.command.execute({
                suspect: "suspect_1",
                clues: ["clue_4"],
                motive: false,
                text: "some.text.token"
            });
            notify.should.be.calledWith("update_suspect_state", {
                suspect: "suspect_1",
                text: "some.text.token",
                clues: {
                    all: ["clue_1", "clue_2", "clue_4"],
                    new: ["clue_4"]
                },
                motive: { value: false, updated: true },
                alibi: { value: true, updated: false }
            })
        });
    });
});

