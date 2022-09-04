var helper = require('./../../helper');
eval(helper.initContextCode());

describe('EndSceneCommand', function() {
    subject('command', function() {
        return new EndSceneCommand();
    });

    var scores = 200000;
    var triggers = [{"trigger": "value"}];
    var start_time = 1231231231;
    var end_time = start_time + 500;

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        this.player = helper.sandbox.stub(context.player, "add_game_balance");


        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "active_scene": {
                    "scene_id": "scene_1",
                    "start": start_time
                }
            },
            "open_cases": {
                "case_01": {
                    "opened_scenes": {
                        "scene_1": {
                            "state": "1",
                            "stars": 2,
                            "hog_count": 3
                        }
                    }
                }
            }
        });

        helper.sandbox.stub(definitions.cases, "case_01", {
            "score_multiplier": 0.5,
            "scenes": {
                "scene_1": {
                    "score_multiplier": 2.2,
                    "type": "hog",
                    "items": {
                        "woman": {}
                    },
                    "states": {
                        "default": {},
                        "1": {
                            "items": ["woman"],
                             "on_complete": triggers
                        }
                    }

                }
            }
        });
    });

    describe('#execute', function() {
        it('should invoke AddSceneScoreCommand', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            this.executor.should.be.calledWith(AddSceneScoreCommand, "scene_1", scores);
        });

        it('should apply scene reward', function() {
            var expected_reward = {
                game_balance: context.hog.calcCoins(scores),
                xp:           context.hog.calcExp()
            }
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            this.executor.should.be.calledWith(ApplyRewardCommand, expected_reward);
        });

        it('should invoke SetSceneStateCommand with "default" state', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            this.executor.should.be.calledWith(SetSceneStateCommand, {scene: "scene_1", state: "default"});
        });

        it('should remove "active_scene" property', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            context.storage.has_property(context.case.activeSceneProp).should.be.false
        });

        it('should invoke PushTriggersCommand with proper triggers', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            this.executor.should.be.calledWith(PushTriggersCommand, triggers);
        });

        it('should update highscore', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            this.executor.should.be.calledWith(UpdateHighscoreCommand, "scene_1", scores);
        });

        it('should delete corresponding task', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            this.executor.should.be.calledWith(DeleteTasksCommand, "investigate", "scene_1");
        });

        it('should throw error if ending time occurs before start', function() {
            var self = this;
            (function() {
                self.command.execute({scene: "scene_1", "scores": scores, "time": 0});
            }).should.throw(LogicError);
        });

        it('should throw error on scores overflow', function() {
            var self = this;
            (function() {
                self.command.execute({scene: "scene_1", "scores": 950000, "time": end_time});
            }).should.throw(LogicError);
        });

        it('should increase count of scene played', function() {
            this.command.execute({scene: "scene_1", "scores": scores, "time": end_time});
            context.case.openedScenes("scene_1").hog_count.should.equal(4);
        });

    });
});

