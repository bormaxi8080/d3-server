var FakePartnersListQA = {};

FakePartnersListQA.handle = function() {
    var fake_partner_defs = context.partners.fakePartner();
    var res = [];
    for (var partner_id in fake_partner_defs) {
        var partner = fake_partner_defs[partner_id];
        res.push({
            id: partner_id,
            name: partner.name,
            img: partner.img,
            level: partner.level,
            hintCount: partner.hints,
            scorePerScene: partner.scores
        });
    }
    return res;
};
