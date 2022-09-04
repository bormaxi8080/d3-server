var helper = require('./../../helper');
eval(helper.initContextCode());

describe('ProgressChapterCommand', function() {

    subject('command', function() {
        return new ProgressChapterCommand();
    });

    var triggers = [{"trigger": "value"}];

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        this.notify = helper.sandbox.stub(context.events, "notify");

        helper.sandbox.stub(definitions.cases, "case_01", {
            "chapters": [{
                "size": 4
            }, {
                "size": 2,
                "on_end": triggers
            }, {
                "size": 2,
                "on_end": []
            }]
        });
    });

    describe('#execute', function() {
        describe('on chapter progress', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "chapter": {
                                "index": 1,
                                "progress": 0,
                                "completed": false
                            }
                        }
                    }
                });
            });

            it('should update chapter progress', function() {
                this.command.execute();
                context.case.currentChapter().progress.should.equal(1);
            });

            it('should apply progress chapter reward', function() {
                this.command.execute();
                this.executor.should.be.calledWith(ApplyRewardCommand, context.case.chapterProgressReward());
            });

            it('should send notify event', function() {
                this.command.execute();
                this.notify.should.be.calledWith("progress_chapter", {
                    "progress": {
                        "from": 0,
                        "to": 1,
                        "total": 2
                    },
                    "reward": context.case.chapterProgressReward(),
                    "img": undefined
                });
            });
        });

        describe('on chapter end', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "chapter": {
                                "index": 1,
                                "progress": 1,
                                "completed": false
                            }
                        }
                    }
                });
            });

            it('should set "completed" flag', function() {
                this.command.execute();
                context.case.currentChapter().completed.should.be.true;
            });

            it('should apply end chapter reward', function() {
                this.command.execute();
                this.executor.should.be.calledWith(ApplyRewardCommand, context.case.chapterEndReward());
            });

            it('should add on_end triggers', function() {
                this.command.execute();
                this.executor.should.be.calledWith(PushTriggersCommand, triggers);
            });

            describe('when chapter is last', function() {
                beforeEach(function() {
                    helper.setContextWorld(context, {
                        "immediate_data": {
                            "active_case": "case_01"
                        },
                        "open_cases": {
                            "case_01": {
                                "chapter": {
                                    "index": 2,
                                    "progress": 1,
                                    "completed": false
                                }
                            }
                        }
                    });
                });

                it('should add silver medal', function() {
                    this.command.execute();
                    this.executor.should.be.calledWith(PushTriggersCommand, [{"add_medal": "silver"}]);
                });
            });

        });

        it('should throw on progressing beyond chapter size', function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "chapter": {
                            "index": 1,
                            "progress": 2,
                            "completed": false
                        }
                    }
                }
            });
            var self = this;
            (function() {
                self.command.execute();
            }).should.throw(LogicError);
        });
    });
});

