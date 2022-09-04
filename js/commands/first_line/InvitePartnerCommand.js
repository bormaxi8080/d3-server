var InvitePartnerCommand = function () { };

InvitePartnerCommand.toString = function() {
    return "invite_partner";
};

InvitePartnerCommand.prototype.execute = function(args) {
    context.system.check_key(args, "partner");
    context.system.check_key(args, "time");

    context.partners.invitePartner(args.partner, args.time);
};
