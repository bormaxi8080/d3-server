var helper = require('./../helper');
eval(helper.initContextCode());

describe('Partners', function() {
    subject('partners', function() {
        return context.partners;
    });

    var my_id = "100";
    var partner_110 = { "ready_time": 20000, "unlocks": {} };
    var partner_120 = { "ready_time": 30000, "unlocks": {} };
    var partner_130 = { "ready_time": 30000, "unlocks": {} };

    beforeEach(function() {
        helper.sandbox.stub(definitions, "partner_settings", {
            "reset_time": 21600,
            "reset_partner_seconds_per_cash": 300,
            "unlock_repeat_interval": 100,
            "unlock_requests_required": 3,
            "unlock_cost_per_request": 7
        });

        helper.sandbox.stub(definitions.partner_fakes, "partners", {
            "fake_1": {
                "reset_time": 1000,
                "hints": 1,
                "scores": 400000,
                "level": 10,
                "img": "images/detective_portrait",
                "name": "partner_fakes.partners.fake_1"
            }
        });

        helper.setContextWorld(context, {
            "player": {
                "social_id": "100"
            },
            "new_cases": {
                "case_01": {
                    "unlock_requests": ["110"]
                },
                "case_02": {
                    "unlock_requests": ["110", "120", "130"]
                },
                "case_03": {}
            },
            "unlocked_cases": ["case_04"],
            "partners" : {
                "110": partner_110,
                "120": partner_120,
                "130": partner_130,
            },
            "fake_partners": {
            }
        });
    });

    describe('#partnerProp', function() {
        it('should return proper property name', function() {
            this.partners.partnerProp("120").should.equal("partners.120");
        });
    });

    describe('#partner', function() {
        it('should return proper partner object', function() {
            this.partners.partner("120").should.deep.equal(partner_120);
        });
    });

    describe('#hasPartner', function() {
        it('should return true on existing partner id', function() {
            this.partners.hasPartner("120").should.be.true;
        });

        it('should return false on unexisting partner id', function() {
            this.partners.hasPartner("9999").should.be.false;
        });
    });

    describe('#invitePartner', function() {
        it('should throw if player tries to invite itself', function() {
            var self = this;
            (function() {
                self.partners.invitePartner(my_id, 10000);
            }).should.throw(LogicError);
        });

        it('should throw on inviting existing partner', function() {
            var self = this;
            (function() {
                self.partners.invitePartner("110", 20000);
            }).should.throw(LogicError);
        });

        it('should add new partner', function() {
            this.partners.invitePartner("140", 25000);
            context.storage.get_property("partners.140").should.deep.equal({ready_time: 25000, unlocks: {}});
        });
    });

    describe('#deletePartner', function() {
        beforeEach(function() {
            this.deleteUsedRequestsByPartner = helper.sandbox.stub(this.partners, "deleteUsedRequestsByPartner");
        });

        it('should throw if player tries to delete itself', function() {
            var self = this;
            (function() {
                self.partners.deletePartner(my_id, 10000);
            }).should.throw(LogicError);
        });

        it('should throw on deleting non-existing partner', function() {
            var self = this;
            (function() {
                self.partners.deletePartner("140", 20000);
            }).should.throw(LogicError);
        });

        it('should delete existing partner', function() {
            this.partners.deletePartner("110", 25000);
            context.storage.has_property("partners.110").should.be.false;
        });

        it('should delete unlock_requests from deleted partner', function() {
            this.partners.deletePartner("110", 25000);
            this.deleteUsedRequestsByPartner.should.be.calledWith("110");
        });
    });

    describe('#usePartner', function() {
        it('should throw on premature call', function() {
            var self = this;
            (function() {
                self.partners.usePartner("110", 15000);
            }).should.throw(LogicError);
        });

        it('should throw on invalid partner id', function() {
            var self = this;
            (function() {
                self.partners.usePartner("400", 15000);
            }).should.throw(LogicError);
        });

        describe('with fake partner', function() {
            it('should update ready_time', function() {
                var reset_time = this.partners.fakePartner("fake_1").reset_time;
                this.partners.usePartner("fake_1", 25000);
                context.storage.get_property("fake_partners.fake_1.ready_time").should.equal(25000 + reset_time * 1000);
            });

            it('should update use_time', function() {
                this.partners.usePartner("fake_1", 25000);
                context.storage.get_property("fake_partners.fake_1.use_time").should.equal(25000);
            });
        });

        describe('with real partner', function() {
            it('should update ready_time', function() {
                var reset_time = context.defs.get_def("partner_settings.reset_time");
                this.partners.usePartner("110", 25000);
                context.storage.get_property("partners.110.ready_time").should.equal(25000 + reset_time * 1000);
            });

            it('should update use_time', function() {
                this.partners.usePartner("110", 25000);
                context.storage.get_property("partners.110.use_time").should.equal(25000);
            });
        });


    });

    describe('#resetPartner', function() {
        it('should throw on invalid partner id', function() {
            var self = this;
            (function() {
                self.partners.resetPartner("400", 15000);
            }).should.throw(LogicError);
        });

        it('should update ready_time to current time', function() {
            var reduce_real_balance = helper.sandbox.stub(context.player, "reduce_real_balance");
            this.partners.resetPartner("120", 25000);
            reduce_real_balance.should.be.calledWith(1);
        });
    });

    describe('#unlockRequestsProp', function() {
        it('should return proper string', function() {
            this.partners.unlockRequestsProp("case_01").should.be.equal("new_cases.case_01.unlock_requests");
        });
    });

    describe('#unlockRequests', function() {
        it('should return array of unlock receipts', function() {
            this.partners.unlockRequests("case_01").should.be.deep.equal(["110"]);
        });

        it('should return empty array on untouched case', function() {
            this.partners.unlockRequests("case_03").should.be.deep.equal([]);
        });
    });

    describe('#usePartnerUnlockRequest', function() {
        it('should add partner to existing unlocks list', function() {
            this.partners.usePartnerUnlockRequest("120", "case_01");
            this.partners.unlockRequests("case_01").should.be.deep.equal(["110", "120"]);
        });

        it('should add partner to new unlocks list', function() {
            this.partners.usePartnerUnlockRequest("130", "case_03");
            this.partners.unlockRequests("case_03").should.be.deep.equal(["130"]);
        });

        it('should throw on invalid partner id', function() {
            var self = this;
            (function() {
                self.partners.usePartnerUnlockRequest("300", "case_01");
            }).should.throw(LogicError);
        });

        it('should throw on invalid case_id', function() {
            var self = this;
            (function() {
                self.partners.usePartnerUnlockRequest("120", "case_WRONG");
            }).should.throw(LogicError);
        });

        it('should throw on duplicate request usage', function() {
            var self = this;
            (function() {
                self.partners.usePartnerUnlockRequest("110", "case_01");
            }).should.throw(LogicError);
        });

        it('should ignore request for unlocked case', function() {
            this.partners.usePartnerUnlockRequest("130", "case_04");
            this.partners.unlockRequests("case_04").should.be.deep.equal([]);
        });
    });

    describe('#leftUnlockRequest', function() {
        it('should return proper count for untouched case', function() {
            this.partners.leftUnlockRequest("case_99").should.be.equal(3);
        });

        it('should return proper count on partially unlocked cases', function() {
            this.partners.leftUnlockRequest("case_01").should.be.equal(2);
        });
    });

    describe('#unlockRequestCost', function() {
        it('should return proper cost for all left requests', function() {
            this.partners.unlockRequestCost("case_03").should.be.deep.equal({
                real_balance: 3 * context.defs.get_def("partner_settings.unlock_cost_per_request")
            });
        });

        it('should return empty cost if no more requests required', function() {
            this.partners.unlockRequestCost("case_02").should.be.deep.equal({});
        });
    });

    describe('#requiredUnlockRequests', function() {
        it('should return corresponding storage value', function() {
            var default_value = context.defs.get_def("partner_settings.unlock_requests_required");
            this.partners.requiredUnlockRequests("case_99").should.be.equal(default_value);
        });
    });

    describe('#unsendUnlockRequestPartners', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "new_cases": {
                    "case_01": {
                        "unlock_requests": ["110"]
                    }
                },
                "partners" : {
                    "110": { "unlocks": { "case_01": 50000 } },
                    "120": { "unlocks": { "case_01": 50000 } },
                    "130": { "unlocks": { } },
                }
            });
        });

        it('should return users who had not send any request ', function() {
            this.partners.unsendUnlockRequestPartners("case_01", 200000).should.include("130");
        });

        it('should return users with expired unlock request interval ', function() {
            this.partners.unsendUnlockRequestPartners("case_01", 200000).should.include("120");
        });

        it('should not return users with unexpired unlock request interval ', function() {
            this.partners.unsendUnlockRequestPartners("case_01", 100000).should.not.include("120");
        });

        it('should not return users with accepted unlock requests at any time', function() {
            this.partners.unsendUnlockRequestPartners("case_01", 100000).should.not.include("110");
            this.partners.unsendUnlockRequestPartners("case_01", 200000).should.not.include("110");
        });

    });

    describe('#hasUnsendUnlockRequests', function() {
        it('should not return true in no request can be sent anymore', function() {
            helper.sandbox.stub(this.partners, "unsendUnlockRequestPartners", function(case_id, time) { return ["120", "130"] });
            this.partners.hasUnsendUnlockRequests("case_01", 200000).should.be.true;
        });

        it('should return false if no request can be sent an the moment', function() {
            helper.sandbox.stub(this.partners, "unsendUnlockRequestPartners", function(case_id, time) { return [] });
            this.partners.hasUnsendUnlockRequests("case_01", 200000).should.be.false;
        });

    });

    describe('#broadcastUnlockRequests', function() {
        var time = 100000;
        beforeEach(function() {
            this.executor = helper.sandbox.stub(Executor, "run");
            helper.sandbox.stub(this.partners, "unsendUnlockRequestPartners", function(case_id, time) { return ["120", "130"] });
        });

        it('should send request for each partner', function() {
            this.partners.broadcastUnlockRequests("case_01", time);
            this.executor.should.have.been.calledWith(SendUnlockRequestCommand, "120", time, "case_01", true);
            this.executor.should.have.been.calledWith(SendUnlockRequestCommand, "130", time, "case_01", true);
        });

        it('should update request timer for each partner', function() {
            this.partners.broadcastUnlockRequests("case_01", time);
            context.storage.get_property("partners.120.unlocks.case_01").should.be.equal(time);
            context.storage.get_property("partners.130.unlocks.case_01").should.be.equal(time);
        });
    });

    describe('#cleanupUnlockRequests', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "partners" : {
                    "110": { "unlocks": { "case_01": 50000 } },
                    "130": { "unlocks": { } },
                }
            });
        });

        it('should delete unlock notifications from partner state', function() {
            this.partners.cleanupUnlockRequests("case_01");
            context.storage.has_property("partners.110.unlocks.case_01").should.be.false;
        });
    });

    describe('#deleteUsedRequestsByPartner', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "new_cases": {
                    "case_01": {
                        "unlock_requests": ["120", "130"]
                    },
                    "case_02": {
                        "unlock_requests": ["120", "140"]
                    }
                }
            });
        });

        it('should delete requests, send by user', function() {
            this.partners.deleteUsedRequestsByPartner("120");
            context.storage.get_property("new_cases.case_01.unlock_requests").should.not.include("120");
            context.storage.get_property("new_cases.case_02.unlock_requests").should.not.include("120");
        });
    });

    describe('#isFake', function() {
        it('should return true on fake partner', function() {
            this.partners.isFake("fake_1").should.be.true;
        });
    });

});
