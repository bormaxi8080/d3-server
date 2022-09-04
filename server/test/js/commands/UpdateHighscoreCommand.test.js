var helper = require('./../helper');
eval(helper.initContextCode());

describe('UpdateHighscoreCommand', function() {
    subject('command', function() {
        return new UpdateHighscoreCommand();
    });

    describe('#execute', function() {
        beforeEach(function() {
            this.executor = helper.sandbox.stub(Executor, "run");
            helper.setContextWorld(context, {
                "immediate_data": {"active_case": "case_01"},
                "open_cases": {
                    "case_01": {}
                },
                "highscores": {
                    "case_01": {
                        "scene_1": 100000
                    }
                }
            });

        });

        describe('when new scores greater than old result', function() {
            it('updates highscore', function() {
                this.command.execute("scene_1", 150000);
                context.case.highscore("scene_1").should.equal(150000);
            });
            it('executes RateAppCommand', function() {
                this.command.execute("scene_1", 150000);
                this.executor.should.be.calledWith(RateAppCommand);
            });
        });
    });
});

