var helper = require('./../../helper');
eval(helper.initContextCode());

describe('OpenCaseCommand', function() {
    subject('command', function() {
        return new OpenCaseCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
    })

    describe('#execute', function() {
        it('should set active case', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": null
                },
                "unlocked_cases": [],
                "open_cases": { "case_01": {} }
            });

            this.command.execute({"case": "case_01"});
            context.storage.get_property("immediate_data.active_case").should.be.equal("case_01");
        });

        it('should drop active scene & minigame if any', function() {
            this.command.execute({"case": "case_01"});
            this.executor.should.have.been.calledWith(DropActiveMinigameCommand);
            this.executor.should.have.been.calledWith(DropActiveSceneCommand);
        });

        describe('when executed with new case', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": null
                    },
                    "unlocked_cases": ["case_01"],
                    "open_cases": { }
                });
            });
            it('should invoke StartNewCase command', function() {
                this.command.execute({"case": "case_01"});
                this.executor.should.be.calledWith(StartNewCaseCommand, "case_01");
            });

            it('should delete case_id from unlocked_cases list', function() {
                this.command.execute({"case": "case_01"});
                context.storage.get_property("unlocked_cases").should.be.deep.equal([]);
            });
        });
    });
});
