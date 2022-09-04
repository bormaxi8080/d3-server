var helper = require('./../helper');
eval(helper.initContextCode());

describe('UnfinishedSceneInfoQA', function() {
    subject('QA', function() {
        return UnfinishedSceneInfoQA;
    });

    describe('#handle', function() {
        var time = Date.now();

        it('should return proper structure with partner_id', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1",
                        "partner_id": "partner_1",
                        "hints": 3,
                        "active_boosters": ["full_hints", "quick_lookup"],
                        "start": time
                    }
                }
            });

            this.QA.handle().should.deep.equal({
                case_id: "case_01",
                scene_id: "scene_1",
                partner_id: "partner_1",
                hints: 3,
                boosters: ["full_hints", "quick_lookup"],
                start: time
            });
        });

        it('should return proper structure without partner_id', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "active_scene": {
                        "scene_id": "scene_1",
                        "hints": 3,
                        "active_boosters": ["full_hints", "quick_lookup"],
                        "start": time
                    }
                }
            });

            this.QA.handle().should.deep.equal({
                case_id: "case_01",
                scene_id: "scene_1",
                partner_id: "",
                hints: 3,
                boosters: ["full_hints", "quick_lookup"],
                start: time
            });
        });
    });
});