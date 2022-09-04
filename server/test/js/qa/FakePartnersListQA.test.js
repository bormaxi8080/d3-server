var helper = require('./../helper');
eval(helper.initContextCode());

describe('FakePartnersListQA', function() {
    subject('QA', function() {
        return FakePartnersListQA;
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
        it('should return list of partners', function() {
            this.QA.handle().should.deep.equal([{
                id: 'fake_1',
                name: 'partner_fakes.partners.fake_01',
                img: 'images/fake_01_portrait',
                level: 10,
                hintCount: 1,
                scorePerScene: 400000
            }]);
        });
    });
});

