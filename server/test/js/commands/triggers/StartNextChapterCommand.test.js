var helper = require('./../../helper');
eval(helper.initContextCode());

describe('StartNextChapterCommand', function() {

    subject('command', function() {
        return new StartNextChapterCommand();
    });

    var some_triggers = [{"trigger_name": "value"}]

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor,"run");
        helper.sandbox.stub(definitions.cases, "case_01", {
            "chapters": [{
                "size": 4
            }, {
                "size": 2,
                "on_start": some_triggers
            }]
        });

        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01"
            },
            "open_cases": {
                "case_01": {
                    "chapter": {
                        "index": 0,
                        "progress": 4,
                        "completed": true
                    }
                }
            }
        });
    });

    describe('#execute', function() {
        it('should update chapter index', function() {
            this.command.execute();
            context.case.currentChapter().should.deep.equal({
                index: 1, progress: 0, completed: false
            });
        });

        it('should push on_start triggers', function() {
            this.command.execute();
            this.executor.should.have.been.calledWith(PushTriggersCommand, some_triggers);
        });

        it('should throw on incomplete current chapter', function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "chapter": {
                            "index": 0,
                            "progress": 3,
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

        it('should throw if current finished chapter is last one', function() {
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "chapter": {
                            "index": 1,
                            "progress": 2,
                            "completed": true
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

