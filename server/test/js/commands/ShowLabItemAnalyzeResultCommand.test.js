var helper = require('./../helper');
eval(helper.initContextCode());

describe('ShowLabItemAnalyzeResultCommand', function() {
    subject('command', function() {
        return new ShowLabItemAnalyzeResultCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
            },
            "open_cases": {
                "case_01": {
                    "found_lab_items": {
                        "lab_item_1": {"state": "done"},
                        "lab_item_2": {"state": "done"}
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "lab_items", {
            "lab_item_1": {
                "analyze_movie": ["m1" , "m2"]
            },
            "lab_item_2": {
                "analyze_movie": "m1"
            }
        });
    });

    describe('#execute', function() {
        describe('when analyze_movie is array', function() {
            it('should push all analyze movies as trigger', function() {
                this.command.execute({lab_item: "lab_item_1", time: 1030});
                this.executor.should.be.calledWith(PushTriggersCommand, [{"show_movie": "m1"}, {"show_movie": "m2"}]);
            });
        });

        describe('when analyze_movie is a string', function() {
            it('should push movies as trigger', function() {
                this.command.execute({lab_item: "lab_item_2", time: 1030});
                this.executor.should.be.calledWith(PushTriggersCommand, [{"show_movie": "m1"}]);
            });
        });
    });
});

