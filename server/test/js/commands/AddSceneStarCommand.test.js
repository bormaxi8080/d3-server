var helper = require('./../helper');
eval(helper.initContextCode());

describe('AddSceneStarCommand', function() {
    subject('command', function() {
        return new AddSceneStarCommand();
    });

    var initial_case_stars = 2;
    var initial_scene_stars = 1;
    var additional_stars = 3;

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": { "active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "medals": ["bronze", "silver"],
                    "status": "open",
                    "stars": initial_case_stars,
                    "tasks": [],
                    "opened_scenes": {
                        "scene_1": {
                            "stars": initial_scene_stars,
                            "hog_count": 3
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "scenes", {
            "scene_1": {
            }
        })
    });

    describe('#execute', function() {
        it('should properly add stars to case star counter', function() {
            this.command.execute("scene_1", additional_stars);
            context.case.stars().should.equal(initial_case_stars + additional_stars);
        });

        it('should properly add stars to scene star counter', function() {
            this.command.execute("scene_1", additional_stars);
            context.case.openedScenes("scene_1").stars.should.equal(initial_scene_stars + additional_stars);
        });

        it('should award gold medal when stars limit is reached', function() {
            Executor.run(AddSceneStarCommand, "scene_1", 4);
            context.storage.get_property("open_cases").case_01.medals.should.include("gold");
        });

        it('should track events success', function() {
            this.trackEvent = helper.sandbox.stub(context.track, "event");
            this.command.execute("scene_1", additional_stars);
            this.trackEvent.should.have.been.calledWith("hog_count", "case_01", "scene_1", 2, 3);
            this.trackEvent.should.have.been.calledWith("hog_count", "case_01", "scene_1", 3, 1);
            this.trackEvent.should.have.been.calledWith("hog_count", "case_01", "scene_1", 4, 1);
        });
    });
});
