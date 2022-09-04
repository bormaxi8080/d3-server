var helper = require('./../helper');
eval(helper.initContextCode());

describe('CaseInfoQA', function() {
    subject('QA', function() {
        return CaseInfoQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "open_cases": {
                    "case_01": {
                        "info": {
                            "weapon": "state_1",
                            "killer": "default",
                            "victim": "state_2"
                        },
                        "chapter": {
                            "index": 0,
                            "progress": 2,
                            "completed": false
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "name": "case_01_name",
                "description": "case_01_desc",
                "info": {
                    "weapon": {
                        "state_1": {
                            "name": "weapon_name_1",
                            "description": "weapon_desc_1",
                            "img": "weapon_img_1"
                        }
                    },
                    "victim": {
                        "state_2": {
                            "name": "victim_name_2",
                            "description": "victim_desc_2",
                            "img": "victim_img_2"
                        }
                    },
                    "killer": {}
                },
                "chapters": [{
                    "size": 3,
                    "img": "chapter_1_img",
                    "name": "chapter_1_name",
                    "description": "chapter_1_default",
                    "description_end": "chapter_1_end"
                }]
            });
            helper.sandbox.stub(definitions, "info", {
                "default_states": {
                    "weapon": {
                        "img": "weapon_img_default",
                        "name": "weapon_name_default",
                        "description": "weapon_description_default"
                    },
                    "victim": {
                        "img": "victim_img_default",
                        "name": "victim_name_default",
                        "description": "victim_description_default"
                    },
                    "killer": {
                        "img": "killer_img_default",
                        "name": "killer_name_default",
                        "description": "killer_description_default"
                    }
                }
            });
        });

        it('should return case_info object', function() {
            this.QA.handle("case_01").should.deep.equal({
                titleText1: 'case_01_name',
                titleText2: 'case_01_desc',
                chapterText1: 'chapter_1_name',
                chapterText2: 'chapter_1_default',
                chapterPic: 'chapter_1_img',
                chapterProgress: 67,
                victimText1: 'victim_name_2',
                victimText2: 'victim_desc_2',
                victimPic: 'victim_img_2',
                weaponText1: 'weapon_name_1',
                weaponText2: 'weapon_desc_1',
                weaponPic: 'weapon_img_1',
                killerText1: 'killer_name_default',
                killerText2: 'killer_description_default',
                killerPic: 'killer_img_default'
          });
        });
    });
});
