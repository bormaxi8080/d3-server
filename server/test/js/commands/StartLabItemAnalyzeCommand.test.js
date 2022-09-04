var helper = require('./../helper');
eval(helper.initContextCode());

describe('StartLabItemAnalyzeCommand', function() {
    subject('command', function() {
        return new StartLabItemAnalyzeCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "analyzed_items": {
                }
            },
            "open_cases": {
                "case_01": {
                    "found_lab_items": {
                        "body": {
                            "state": "new"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "lab_items", {
            "body": {
                "analyze_time": 20
            }
        })
    });

    describe('#execute', function() {
        it('should switch lab item state to analyzing', function() {
            this.command.execute({lab_item: "body", time: 1000});
            context.case.foundLabItems("body").should.deep.equal({state: "analyzing"});
        });

        it('should add analyze time to immediate_data.analyzed_items', function() {
            this.command.execute({lab_item: "body", time: 1000});
            context.case.analyzedItems("body").should.deep.equal({end: 21000});
        });

    });
});

