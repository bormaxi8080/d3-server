var helper = require('./../helper');
eval(helper.initContextCode());

describe('SuspectInfoListQA', function() {
    subject('QA', function() {
        return SuspectInfoListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                },
                "open_cases": {
                    "case_01": {
                        "known_suspects": {
                            "john": {
                                "alibi": true,
                                "motive": null,
                                "clues": ["drunk"],
                                "state": "arrest"
                            },
                            "kennedy": {
                                "alibi": null,
                                "motive": false,
                                "clues": [],
                                "state": "custom"
                            }
                        }
                    }
                }
            });

            helper.sandbox.stub(definitions.cases, "case_01", {
                "suspect_properties": {
                    "prop_1": "age",
                    "prop_2": "weight"
                },
                "suspects": {
                    "john": {
                        "clues": {
                            "drunk": {
                                "img": "images/drunk.png",
                                "match": false
                            },
                            "dead": {
                                "img": "images/dead.png"
                            }
                        },
                        "states": {
                            "default": {
                                "status": "friend",
                                "img": "images/john.png"
                            },
                            "arrest": {
                                "title": "ololo",
                                "prop_1": "999",
                                "prop_2": "1024 kg",
                            }
                        }
                    },
                    "kennedy": {
                        "clues": {
                        },
                        "states": {
                            "default": {
                                "img": "images/kennedy.png"
                            },
                            "custom": {
                                "button_title": "custom_title",
                                "button_color": "red",
                                "title": "great man",
                                "prop_1": "12",
                                "prop_2": "10 kg",
                            }
                        }
                    }
                },
                "arrest": {
                    "killer": "kennedy"
                }
            });
        });

        it('should return suspect_info_list object', function() {
            this.QA.handle().should.deep.equal([{
                "name": "john",
                "visible": true,
                "alibi": true,
                "motive": null,
                "killer": false,
                "picPath": "images/john.png",
                "title": "ololo",
                "status": "friend",
                "text1": "999",
                "text2": "1024 kg",
                "text1Title": "interface.suspect.properties.age.title",
                "text1Pic": "images/age_icon.png",
                "text2Title": "interface.suspect.properties.weight.title",
                "text2Pic": "images/weight_icon.png",
                "starCost": 1,
                "buttonText": "interface.suspect.button_title.arrest",
                "buttonColor": "red",
                "signs": [{
                    "link": "drunk",
                    "visible": true,
                    "match": false,
                    "hidden": false,
                    "picPath": "images/drunk.png"
                }]
            },{
                "name": "kennedy",
                "visible": true,
                "alibi": null,
                "motive": false,
                "killer": true,
                "picPath": "images/kennedy.png",
                "title": "great man",
                "status": "",
                "text1": "12",
                "text2": "10 kg",
                "text1Title": "interface.suspect.properties.age.title",
                "text1Pic": "images/age_icon.png",
                "text2Title": "interface.suspect.properties.weight.title",
                "text2Pic": "images/weight_icon.png",
                "starCost": 1,
                "buttonText": "custom_title",
                "buttonColor": "red",
                "signs": []
            }]);
        });
    });
});
