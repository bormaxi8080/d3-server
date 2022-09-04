var helper = require('./../helper');
eval(helper.initContextCode());

describe('LabItemRemainingTimeListQA', function() {
    subject('QA', function() {
        return LabItemRemainingTimeListQA;
    });

    describe('#handle', function() {
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
                        "item_type": "body",
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

        it('should return list of analyzed items', function() {
            this.QA.handle(5000).should.deep.equal({
                "sled": {
                    "remainingText": '00:16:35',
                    "forceCost": 4
                },
                "otpechatok": {
                    "remainingText": '00:36:35',
                    "forceCost": 8
                }
            });
        });
    });
});
