var helper = require('./../helper');
eval(helper.initContextCode());

describe('SuspectFormatCluesQA', function() {
    subject('QA', function() {
        return SuspectFormatCluesQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.sandbox.stub(definitions.cases, "case_01", {
                "clues": {
                    "clue_1": {
                        "img": "images/clue_1"
                    },
                    "hidden_clue_2": {
                        "img": "images/clue_2"
                    },
                    "clue_3": {
                        "img": "images/clue_3"
                    }
                },
                "suspects": {
                    "john": {
                        "clues": {
                            "clue_1": {
                                "img": "images/clue_1"
                            },
                            "hidden_clue_2": {},
                            "clue_3": {
                                "img": "images/clue_3"
                            }
                        },
                        "states": {
                            "default": {
                                "title": "john_title",
                                "img": "images/char_john",
                             }
                        }
                    }
                }
            });

            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                },
                "open_cases": {
                    "case_01": {
                        "known_suspects": {
                            "john": {
                                "state": "default"
                            }
                        }
                    }
                }
            });
        });

        it('should return suspect info if suspect_id passed', function() {
            this.QA.handle({
                suspect: "john",
                text: "some.text.token",
                clues: {
                    all: ["clue_1", "hidden_clue_2"],
                    new: ["hidden_clue_2"]
                },
                motive: { value: false, updated: true },
                alibi: { value: true, updated: false }
            }).should.deep.equal({
                is_killer: false,
                text: "some.text.token",
                img: "images/char_john",
                title: "john_title",
                clues: [{
                    "img": "images/clue_1",
                    "new": false
                }, {
                    "img": "images/clue_2",
                    "new": true
                }],
                alibi: true,
                alibi_updated: false,
                motive: false,
                motive_updated: true
            });
        });

        it('should return killer info if no suspect_id passed', function() {
            this.QA.handle({
                text: "some.text.token",
                clues: {
                    all: ["hidden_clue_2", "clue_3"],
                    new: ["hidden_clue_2"]
                },
                motive: { value: true, updated: false },
                alibi: { value: false, updated: false }
            }).should.deep.equal({
                is_killer: true,
                text: "some.text.token",
                img: "images/some_man.png",
                title: "interface.suspect.killer_title",
                clues: [{
                    "img": "images/clue_2",
                    "new": true
                }, {
                    "img": "images/clue_3",
                    "new": false
                }],
                alibi: false,
                alibi_updated: false,
                motive: true,
                motive_updated: false
            });
        });

    });
});

