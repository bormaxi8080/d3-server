var helper = require('./../../helper');
eval(helper.initContextCode());

describe('SetSceneStateCommand', function() {
    subject('command', function() {
        return new SetSceneStateCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "opened_scenes": {
                        "scene_1": {
                            "state": "state_1"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "scenes", {
            "scene_1": {
                "states": {
                    "state_1": {},
                    "state_2": {}
                }
            }
        });
        this.executor = helper.sandbox.stub(Executor, "run");
    });

    describe('#execute', function() {
        it('should change scene state in active case', function() {
            this.command.execute({"scene": "scene_1", "state": "state_2"});
            context.case.openedScenes("scene_1").state.should.equal("state_2");
        });

        it('should accept "default" state', function() {
            this.command.execute({"scene": "scene_1", "state": "default"});
            context.case.openedScenes("scene_1").state.should.equal("default");
        });

        it('should create task if non-default state passed', function() {
            this.command.execute({"scene": "scene_1", "state": "state_1"});
            this.executor.should.have.been.calledWith(PushTaskCommand, {"type": "investigate", "object_id": "scene_1"});
        });
    });
});

