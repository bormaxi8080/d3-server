var helper = require('./../../helper');
eval(helper.initContextCode());

describe('StartMinigameCommand', function() {
    subject('command', function() {
        return new StartMinigameCommand();
    });

    var start_time = 1000;

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01"
            },
            "open_cases": {
                "case_01": {
                    "stars" : 1,
                    "found_forensic_items": {
                        "forensic_item_1": {
                            "state": "state_1"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "forensic_items", {
            "forensic_item_1": {
                "states": {
                    "state_1": {
                        "minigame": {
                            "type": "puzzle"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.case_settings, "default_minigame_cost", 1);
    });

    describe('#execute', function() {
        it('should add active minigame data', function() {
            this.command.execute({forensic_item: "forensic_item_1", time: start_time});
            context.case.activeMinigame().should.deep.equal({forensic_item: "forensic_item_1", start: start_time});
        });
    });
    describe('#execute', function() {
        it('should throw exception then not enought stars', function () {
              helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                },
                "open_cases": {
                    "case_01": {
                        "stars" : 0,
                        "found_forensic_items": {
                            "forensic_item_1": {
                                "state": "state_1"
                            }
                        }
                    }
                }
            });
            var self = this;
            (function() {
                self.command.execute({forensic_item: "forensic_item_1", time: start_time});
            }).should.throw(LogicError);
        });
    });
});

