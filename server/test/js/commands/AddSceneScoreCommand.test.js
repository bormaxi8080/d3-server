var helper = require('./../helper');
eval(helper.initContextCode());

describe('AddSceneScoreCommand', function() {
    subject('command', function() {
        return new AddSceneScoreCommand();
    });

    var initial_score = 20000;

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "stars": 2,
                    "opened_scenes": {
                        "scene_1": {
                            "score": initial_score,
                            "stars": 3
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "scenes", {
            "scene_1": {
                "scores": [
                    100000,
                    200000,
                    300000,
                    400000,
                    500000
                ]
            }
        });
    });

    describe('#execute', function() {
        it('should add score', function() {
            this.command.execute("scene_1", 10000);
            context.case.openedScenes("scene_1").score.should.equal(initial_score + 10000);
        });

        it('should reduce score on getting enough score for a star', function() {
            this.command.execute("scene_1", 400000);
            context.case.openedScenes("scene_1").score.should.equal(initial_score);
        });

        it('should invoke AddSceneStarCommand on getting enough score for a star', function() {
           this.command.execute("scene_1", 400000);
           this.executor.should.be.calledWith(AddSceneStarCommand, "scene_1", 1);
        });

        it('should set score to 0 after getting a last star', function() {
           this.command.execute("scene_1", 4000000);
           context.case.openedScenes("scene_1").score.should.equal(0);
        });
    });
});

