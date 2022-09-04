var helper = require('./../helper');
eval(helper.initContextCode());

describe('EndLabItemAnalyzeCommand', function() {
    subject('command', function() {
        return new EndLabItemAnalyzeCommand();
    });

    var trigger_1 = {"some_trigger": "some_value"}
    var trigger_2 = {"other_trigger": "other_value"}

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "analyzed_items": {
                    "case_01": {
                        "body": {
                            "end": 1020
                        }
                    }
                }
            },
            "open_cases": {
                "case_01": {
                    "found_lab_items": {
                        "body": {
                            "state": "analyzing"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "lab_items", {
            "body": {
                "analyze_time": 20,
                "analyze_movie": "m2",
                "on_analyze": [trigger_2]
            }
        })
    });

    describe('#execute', function() {
        beforeEach(function() {
            this.command.execute({lab_item: "body", time: 1030});
        })

        it('should switch lab item state to done', function() {
            context.case.foundLabItems("body").should.deep.equal({state: "done"});
        });

        it('should delete lab item from immediate data', function() {
            context.case.analyzedItems().should.not.have.ownProperty('body');
        });

        it('should show analyze results', function() {
            this.executor.should.be.calledWith(ShowLabItemAnalyzeResultCommand, {lab_item: "body", time: 1030});
        });

        it('should push scenarion triggers to case trigger list', function() {
            this.executor.should.be.calledWith(PushTriggersCommand, [trigger_2]);
        });

        it('should delete corresponding task', function() {
            this.executor.should.be.calledWith(DeleteTasksCommand, "analyze", "body");
        });
    });
});

