var helper = require('./../helper');
eval(helper.initContextCode());

describe('TalkSuspectCommand', function() {
    subject('command', function() {
        return new TalkSuspectCommand();
    });

    var movie0_id = "m1"
    var movie1_id = "m2"
    var trigger_movie_0 = {"show_movie": movie0_id}
    var trigger_movie_1 = {"show_movie": movie1_id}
    var trigger_talk = {"trigger_talk": "value_1"}

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "triggers": {
                    "case_01": []
                }
            },
            "open_cases": {
                "case_01": {
                    "known_suspects": {
                        "suspect_1": {
                            "talked": false,
                            "state": "interrogation_1"
                        },
                        "suspect_2": {
                            "talked": true,
                            "state": "interrogation_1"
                        },
                        "suspect_3": {
                            "state": "default"
                        },
                        "suspect_4": {
                            "state": "arrest"
                        },
                        "suspect_5": {
                            "talked": false,
                            "state": "interrogation_1"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases, "case_01", {
            "suspects": {
                "suspect_1": {
                    "states": {
                        "interrogation_1": {
                            "talk_cost": 1,
                            "talk_movie": movie0_id,
                            "on_talk": [trigger_talk]
                        }
                    }
                },
                "suspect_2": {
                    "states": {
                        "interrogation_1": {
                            "talk_cost": 1,
                            "talk_movie": movie1_id,
                            "on_talk": [trigger_talk]
                        }
                    }
                },
                "suspect_3": {},
                "suspect_4": {},
                "suspect_5": {
                    "states": {
                        "interrogation_1": {
                            "talk_cost": 1,
                            "talk_movie": [movie0_id, movie1_id],
                            "on_talk": [trigger_talk]
                        }
                    }
                }
            }
        });
        this.executor = helper.sandbox.stub(Executor,"run");
    });

    describe('#execute', function() {
        it('should throw LogicError on arrest user state', function() {
            var self = this;
            (function() {
                self.command.execute({suspect: "suspect_4"});
            }).should.throw(LogicError);
        });

        it('should not throw LogicError on default user state', function() {
            var self = this;
            (function() {
                self.command.execute({suspect: "suspect_3"});
            }).should.not.throw(LogicError);
        });

        describe('on first talk with suspect', function() {
            beforeEach(function() {
                this.talk_cost = context.case.suspectClickCost("suspect_1");
                this.command.execute({suspect: "suspect_1"});
            });

            it('should push movie and on_talk triggers', function() {
                this.executor.should.have.been.calledWith(PushTriggersCommand, [trigger_movie_0, trigger_talk]);
            });

            it('should set talker flag to true', function() {
                context.case.knownSuspects("suspect_1").talked.should.be.true
            });

            it('should consume stars', function() {
                this.executor.should.have.been.calledWith(ConsumeStarCommand, this.talk_cost);
            });

            it('should delete corresponding talk task', function() {
                this.executor.should.have.been.calledWith(DeleteTasksCommand, "talk", "suspect_1");
            });
        });

        describe('on repeat talk with suspect', function() {
            beforeEach(function() {
                this.command.execute({suspect: "suspect_2"});
            });

            it('should push movie trigger only', function() {
                this.executor.should.have.been.calledWith(PushTriggersCommand, [trigger_movie_1]);
            });

            it('should not consume stars', function() {
                this.command.execute({suspect: "suspect_2"});
                this.executor.should.not.have.been.calledWith(ConsumeStarCommand);
            });

            it('should not try to delete talk task', function() {
                this.executor.should.not.have.been.calledWith(DeleteTasksCommand, "talk", "suspect_1");
            });
        });

        it('should push two movie trigger if talk_movie is array', function() {
            this.command.execute({suspect: "suspect_5"});
            this.executor.should.have.been.calledWith(PushTriggersCommand, [trigger_movie_0, trigger_movie_1, trigger_talk]);
        });
    });
});

