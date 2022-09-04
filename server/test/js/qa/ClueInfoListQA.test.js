var helper = require('./../helper');
eval(helper.initContextCode());

describe('ClueInfoListQA', function() {
    subject('QA', function() {
        return ClueInfoListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": { "active_case": "case_01" },
                "open_cases": {
                    "case_01": {
                        "found_forensic_items": {
                            "zapiska": {
                                "state": "new",
                                "index": 0
                            },
                            "sumka": {
                                "state": "explored",
                                "index": 1
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "forensic_items": {
                    "zapiska": {
                        "initial_state": "new",
                        "states": {
                            "new": {
                                "img": "images/torn_papers.png",
                                "button_title": "explore_button_title",
                                "wrapped": false,
                                "minigame": {
                                    "data": {
                                        "type": "puzzle",
                                        "path": "pieces_mg"
                                    },
                                    "title": "torn_papers_puzzle_title",
                                    "img_result": "images/result_torn_papers.png",
                                    "on_complete":[]
                                }
                            },
                            "explored": {
                                "image": "images/note.png"
                            }
                        }
                    },
                    "sumka": {
                        "initial_state": "new",
                        "states": {
                            "new": {
                                "img": "images/woman_purse.png",
                                "button_title": "explore_button_title",
                                "minigame": {
                                    "data": {
                                        "type": "puzzle",
                                        "path": "pieces_mg"
                                    },
                                    "title": "woman_purse_puzzle_title",
                                    "on_complete":[]
                                }
                            },
                            "explored": {
                                "img": "images/woman_purse.png",
                                "movie": "m10"
                            }
                        }
                    },
                    "phone": {
                        "initial_state": "new",
                        "states": {
                            "new": {
                                "img": "images/smartphone.png",
                                "button_title": "explore_button_title",
                                "minigame": {
                                    "data": {
                                        "type": "puzzle",
                                        "path": "pieces_mg"
                                    },
                                    "title": "phone_puzzle_title",
                                    "button_title": "explore_button_title",
                                    "on_complete":[]
                                }
                            },
                            "explored": {
                                "image": "images/code.png"
                            }
                        }
                    }
                }
            });
        });

        it('should return ordered list of clue_info objects', function() {
            this.QA.handle().should.deep.equal([{
                index: 1,
                name: "sumka",
                visible: true,
                wrapped: true,
                pic: 'images/woman_purse.png',
                isNew: false,
                buttonTitle: "interface.forensics.button_title.repeat",
                buttonColor: "blue",
                starCost: 0
            },  {
                index: 0,
                name: "zapiska",
                visible: true,
                wrapped: false,
                pic: 'images/torn_papers.png',
                isNew: true,
                buttonTitle: "explore_button_title",
                buttonColor: "green",
                starCost: 1
            }]);
        });
    });
});
