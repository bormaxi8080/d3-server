var UsePartnerCommand = function () {};

UsePartnerCommand.toString = function () {
    return "use_partner";
};

UsePartnerCommand.prototype.execute = function(partner_id, time) {
    context.partners.usePartner(partner_id, time);
    Executor.run(SendGiftCommand, partner_id, time, "hog_usage", 1, {energy: 1});
};
