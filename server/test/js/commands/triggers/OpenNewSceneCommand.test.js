var helper = require('./../../helper');
eval(helper.initContextCode());

describe('OpenNewSceneCommand', function() {
    subject('command', function() {
        return new OpenNewSceneCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "opened_scenes": {}
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "scenes", {
            "scene_1": {
                "states":{
                    "default": {},
                    "1": {}
                },
                "stars": []
            }
        })
    });

    describe('#execute', function() {
        it('should add scene to opened scenes', function() {
            this.command.execute("scene_1");
            context.case.openedScenes("scene_1").should.deep.equal({
                stars: 0,
                score: 0,
                hog_count: 0,
                state: "default"
            });
        })
    });
});

