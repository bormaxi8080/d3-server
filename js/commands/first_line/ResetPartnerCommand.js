var ResetPartnerCommand = function () { };

ResetPartnerCommand.toString = function() {
    return "reset_partner";
};

ResetPartnerCommand.prototype.execute = function(args) {
    context.system.check_key(args, "partner");
    context.system.check_key(args, "time");

    context.partners.resetPartner(args.partner, args.time);
};
