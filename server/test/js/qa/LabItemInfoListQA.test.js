var helper = require('./../helper');
eval(helper.initContextCode());

describe('LabItemInfoListQA', function() {
    subject('QA', function() {
        return LabItemInfoListQA;
    });

    describe('#lab_item_info_list', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "analyzed_items": {
                        "case_01": {
                            "sled": {
                                "end": 1000000
                            },
                            "otpechatok": {
                                "end": 2200000
                            }
                        }
                    }
                },
                "open_cases": {
                    "case_01": {
                        "found_lab_items": {
                            "body": {
                                "state": "done",
                                "index": 0
                            },
                            "sled": {
                                "state": "analyzing",
                                "index": 2
                            },
                            "otpechatok": {
                                "state": "analyzing",
                                "index": 1
                            },
                            "other": {
                                "state": "new",
                                "index": 3
                            }
                        }
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "lab_items": {
                    "body": {
                        "name": "lab_body",
                        "img": "images/woman_body.png",
                        "item_type": "medicals",
                        "analyze_time": 1000,
                        "analyze_movie": "m3",
                        "on_analyze": []
                    },
                    "sled": {
                        "name": "lab_sled",
                        "img": "images/footprint.png",
                        "item_type": "chemicals",
                        "analyze_time": 100,
                        "analyze_movie": "m3",
                        "on_analyze": []
                    },
                    "otpechatok": {
                        "name": "lab_otpechatok",
                        "img": "images/fingerprint.png",
                        "item_type": "chemicals",
                        "analyze_time": 500,
                        "analyze_movie": "m3",
                        "on_analyze": []
                    },
                    "other": {
                        "name": "lab_other",
                        "img": "images/other.png",
                        "item_type": "technics",
                        "analyze_time": 100,
                        "analyze_movie": "m3",
                        "on_analyze": []
                    }
                }
            });
        });

        it('should return ordered list of lab_item_info objects', function() {
            this.QA.handle(1800000).should.deep.equal([{
                index: 3,
                visible: true,
                name: 'other',
                title: 'lab_other',
                pic: 'images/other.png',
                progress: 0,
                forceCost: 1,
                buttonTitle: 'interface.laboratory.button_title.new',
                buttonColor: 'green',
                persPic: "images/char_tehnik.png",
                persText: "interface.laboratory.item_types.text.new",
                tipText: "00:01:40"
            }, {
                index: 2,
                visible: true,
                name: 'sled',
                title: 'lab_sled',
                pic: 'images/footprint.png',
                progress: 1,
                forceCost: 0,
                buttonTitle: 'interface.laboratory.button_title.analyzed',
                buttonColor: 'green',
                persPic: "images/char_expert_himik.png",
                persText: "interface.laboratory.item_types.text.analyzed",
                tipText: "interface.laboratory.tip_text.analyzed"
            }, {
                index: 1,
                visible: true,
                name: 'otpechatok',
                title: 'lab_otpechatok',
                pic: 'images/fingerprint.png',
                progress: 0.19999999999999996,
                forceCost: 2,
                buttonTitle: 'interface.laboratory.button_title.analyzing',
                buttonColor: 'blue',
                persPic: "images/char_expert_himik.png",
                persText: "interface.laboratory.item_types.text.analyzing",
                tipText: "00:06:40"
            }, {
                index: 0,
                visible: true,
                name: 'body',
                title: 'lab_body',
                pic: 'images/woman_body.png',
                progress: 1,
                forceCost: 0,
                buttonTitle: 'interface.laboratory.button_title.done',
                buttonColor: 'gray',
                persPic: "images/char_expert_medik.png",
                persText: "interface.laboratory.item_types.text.done",
                tipText: "interface.laboratory.tip_text.done"
            }]);
        });
    });
});
