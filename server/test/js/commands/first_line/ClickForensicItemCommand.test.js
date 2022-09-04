var helper = require('./../../helper');
eval(helper.initContextCode());

describe('ClickForensicItemCommand', function() {
    subject('command', function() {
        return new ClickForensicItemCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01"
            },
            "open_cases": {
                "case_01": {
                    "found_forensic_items": {
                        "item_0": {
                          "state": "new"
                        },
                        "item_1": {
                          "state": "explored"
                        },
                        "item_2": {
                          "state": "explored"
                        }
                    }
                }
            }
        });

        helper.sandbox.stub(definitions.cases.case_01, "forensic_items", {
            "item_0": {
                "states": {
                    "new": {
                       "minigame": {
                            "data": {"val": "val"},
                            "img_result": "minigame_img_result",
                            "title": "minigame_title"
                        }
                    }
                }
            },
            "item_1": {
                "states": {
                    "explored": {
                        "movie": "m1"
                    }
                }
            },
            "item_2": {
                "states": {
                    "explored": {
                        "movie": ["m1", "m2"]
                    }
                }
            }
        });
    });

    describe('#execute', function() {
        it('should throws LogicError if forensic item does not exist', function() {
            var self = this;
            (function() {
                self.command.execute({forensic_item: "item_not_exists", time : 1});
            }).should.throw(LogicError);
        });

        it('should not throw LogicError if forensic item exists', function() {
            var self = this;
            (function() {
                self.command.execute({forensic_item: "item_0", time : 1});
            }).should.not.throw(LogicError);
        });

        describe('when forensic item state contains minigame', function() {
            it('should send notify event', function() {
                this.notify = helper.sandbox.stub(context.events, "notify");
                this.command.execute({forensic_item: "item_0", time : 1});
                this.notify.should.have.been.calledWith("start_minigame", {
                    forensic_item_id: "item_0",
                    data: {"val": "val"},
                    title: "minigame_title",
                    img_result: "minigame_img_result"
                });
            });
        });

        describe('when forensic item state contains movie', function() {
            it('should push only one movie trigger when movie is a string', function() {
                this.command.execute({forensic_item: "item_1", time : 1});
                this.executor.should.have.been.calledWith(PushTriggersCommand, [{"show_movie" : "m1"}]);
            });

            it('should push multiple movie triggers when movie is an array', function() {
                this.command.execute({forensic_item: "item_2", time : 1});
                this.executor.should.have.been.calledWith(PushTriggersCommand, [{"show_movie" : "m1"}, {"show_movie" : "m2"}]);
            });
        });
    });
});