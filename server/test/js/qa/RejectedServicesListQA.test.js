var helper = require('./../helper');
eval(helper.initContextCode());

describe('RejectedServicesListQA', function() {
    subject('QA', function() {
        return RejectedServicesListQA;
    });

    var now = Date.now();
    var delta_time = 100000000;
    var before = now - delta_time;
    var after = now + delta_time;

    beforeEach(function() {
        helper.setContextWorld(context, {
            "new_cases": {
                "case_02": {},
                "case_03": {}
            }
        });
    });

    it('with expired services',function() {
        this.services = {
            "send_gift": {
                "1": {
                    "operation_id": 1,
                    "result": {
                        "partner_id": "c4ec2befa05df5e17f4c84aa078f20df",
                        "type": "hog_usage",
                        "count": 5,
                        "content": {energy: 10},
                        "expires_date": after
                    },
                    "error": false
                },
                "2": {
                    "operation_id": 2,
                    "result": {
                        "partner_id": "c4ec2befa05df5e17f4c84aa078f20df",
                        "type": "hog_usage",
                        "count": 5,
                        "content": {energy: 10},
                        "expires_date": before
                    },
                    "error": false
                }
            }
        };
        this.QA.handle(this.services, now).should.deep.equal([ {
            service_id: "send_gift",
            operation_id: 2
        }]);
    });

    describe('with unlock_request', function() {
        describe('on request', function() {
            it('when we received multiple requests from one partner', function() {
                this.services = {
                    "unlock_request": {
                        "1": {
                            "operation_id": 1,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_01",
                                "request": true,
                                "expires_date": after
                            },
                            "error": false
                        },
                        "2": {
                            "operation_id": 2,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_01",
                                "request": true,
                                "expires_date": after - 10
                            },
                            "error": false
                        }
                    }
                };
                this.QA.handle(this.services, now).should.deep.equal([ {
                    service_id: "unlock_request",
                    operation_id: 2
                }]);
            });
        });

        describe('on response', function() {
            it('when we received multiple responses from one partner', function() {
                this.services = {
                    "unlock_request": {
                        "1": {
                            "operation_id": 1,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_02",
                                "request": false,
                                "expires_date": after
                            },
                            "error": false
                        },
                        "2": {
                            "operation_id": 2,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_02",
                                "request": false,
                                "expires_date": after - 10
                            },
                            "error": false
                        },
                        "3": {
                            "operation_id": 3,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_02",
                                "request": false,
                                "expires_date": after - 20
                            },
                            "error": false
                        }
                    }
                };
                this.QA.handle(this.services, now).should.deep.equal([ {
                    service_id: "unlock_request",
                    operation_id: 2
                }, {
                    service_id: "unlock_request",
                    operation_id: 3
                }]);
            });

            it('when we received response on non-new case', function() {
                 this.services = {
                    "unlock_request": {
                        "1": {
                            "operation_id": 1,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_01",
                                "request": false,
                                "expires_date": after
                            },
                            "error": false
                        }
                    }
                };
                this.QA.handle(this.services, now).should.deep.equal([ {
                    service_id: "unlock_request",
                    operation_id: 1
                }]);
            });

            it('when we alredy accepted request form partner', function() {
                helper.setContextWorld(context, {
                    "new_cases": {
                        "case_02": {
                            "unlock_requests": [
                                "c1b53fe519a7c3a8a66c50c1accb40f6"
                            ]
                        }
                    }
                });
                this.services = {
                    "unlock_request": {
                        "1": {
                            "operation_id": 1,
                            "result": {
                                "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                                "case_id": "case_02",
                                "request": false,
                                "expires_date": after
                            },
                            "error": false
                        },
                        "2": {
                            "operation_id": 2,
                            "result": {
                                "partner_id": "c4ec2befa05df5e17f4c84aa078f20df",
                                "case_id": "case_02",
                                "request": false,
                                "expires_date": after
                            },
                            "error": false
                        }

                    }
                };
                this.QA.handle(this.services, now).should.deep.equal([ {
                    service_id: "unlock_request",
                    operation_id: 1
                }]);
            });
        });
    });

});
