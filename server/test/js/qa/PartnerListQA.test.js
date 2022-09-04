var helper = require('./../helper');
eval(helper.initContextCode());

describe('PartnerListQA', function() {
    subject('QA', function() {
        return PartnerListQA;
    });

    beforeEach(function() {
        helper.sandbox.stub(definitions, "partner_settings", {
            "reset_time": 21600,
            "reset_partner_seconds_per_cash": 300,
            "unlock_requests_required": 3
        });

        helper.sandbox.stub(definitions.partner_fakes, "partners", {
            "fake_1": {
                "reset_time": 0,
                "hints": 1,
                "scores": 400000,
                "level": 10,
                "img": "images/fake_01_portrait",
                "name": "partner_fakes.partners.fake_01"
            }
        });
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "partners": {
                    "110": {
                        "ready_time": 20000,
                        "use_time": 15000
                    },
                    "120": {
                        "ready_time": 400001,
                        "use_time": 20000
                    }
                },
                "fake_partners": {
                }
            });
        });

        it('should return list of partners', function() {
            this.QA.handle(30000).should.deep.equal([{
                id: '110',
                forceCost: '',
                isReady: true,
                isFake: false,
                readyTime: '',
                readyFraction: 0
            }, {
                id: '120',
                forceCost: '2$',
                isReady: false,
                isFake: false,
                readyTime: '00:06:11',
                readyFraction: 0.02631572022178889
            }, {
                id: 'fake_1',
                forceCost: '',
                isReady: true,
                isFake: true,
                readyTime: '',
                readyFraction: 0
            }]);
        });
    });
});

