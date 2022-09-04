var helper = require('./../helper');
eval(helper.initContextCode());

describe('Case', function() {
    subject('case', function() {
        return context.case;
    });

    beforeEach(function() {
        helper.setContextWorld(context, {"immediate_data": {"active_case": "case_01"} });
    });

    describe('#infoStateProp', function() {
        it('should return proper path for current state', function() {
            this.case.infoStateProp("weapon", "state_1").should.equal("cases.case_01.info.weapon.state_1");
        });

        it('should return proper path for default state', function() {
            this.case.infoStateProp("weapon", "default").should.equal("info.default_states.weapon");
        });
    });

    describe("#sceneStarScores", function() {
        beforeEach(function() {
            helper.sandbox.stub(definitions.cases.case_01, "scenes", {
                "scene_1": {
                    "scores": [100, 200, 300, 400, 500]
                }
            });
            helper.sandbox.stub(definitions.hog_settings, "star_base_scores", [
                1000, 2000, 3000, 4000, 5000
            ]);
        });

        it('should return custom values for scene, if defined', function() {
            this.case.sceneStarScores("scene_1").should.deep.equal([100, 200, 300, 400, 500]);
        });
    });

    describe("#isCustomTaskCompleted", function() {
        var task_id = "custom_1";

        it('returns true if task was performed and not active', function() {
            helper.sandbox.stub(this.case, "performedCustomTasks", function() {
                return [task_id];
            });
            helper.sandbox.stub(this.case, "tasks", function() {
                return [];
            });
            this.case.isCustomTaskCompleted(task_id).should.be.true;
        });

        it('returns false if task was not ever performed', function() {
            helper.sandbox.stub(this.case, "performedCustomTasks", function() {
                return [];
            });
            this.case.isCustomTaskCompleted(task_id).should.be.false;
        });

        it('returns false if task is active', function() {
            helper.sandbox.stub(this.case, "performedCustomTasks", function() {
                return [task_id];
            });
            helper.sandbox.stub(this.case, "tasks", function() {
                return [{type: "custom", object_id: task_id}];
            });
            this.case.isCustomTaskCompleted(task_id).should.be.false;
        });
    });
});

