var PartnerListQA = {};

PartnerListQA.format_partner = function(time, partner_id, partner, is_fake) {
    var ready_time = Math.max(Math.ceil(((partner.ready_time || 0) - time) / 1000), 0);

    var ready_fraction = 0;
    if (ready_time > 0) {
        ready_fraction = (time - partner.use_time) / (partner.ready_time - partner.use_time);
    }

    return {
        id: partner_id,
        forceCost: QAHelper.map_cost({real_balance: context.partners.calculateResetCost(ready_time)}),
        isReady: (ready_time == 0),
        isFake: is_fake,
        readyTime: (ready_time == 0 ? "" : QAHelper.format_seconds(ready_time)),
        readyFraction: ready_fraction
    }
};

PartnerListQA.handle = function(time) {
    var res = [];
    var partners = context.partners.partner(null);
    for (var partner_id in partners) {
        res.push(PartnerListQA.format_partner(time, partner_id, partners[partner_id], false));
    }

    var fake_partners = context.partners.fakePartner();
    var partners = context.partners.partner(null, true);
    for (var partner_id in fake_partners) {
        var partner = partners[partner_id] || {}
        res.push(PartnerListQA.format_partner(time, partner_id, partner, true));
    }
    return res;
};
