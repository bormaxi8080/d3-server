var DeletePartnerCommand = function () { };

DeletePartnerCommand.toString = function() {
    return "delete_partner";
};

DeletePartnerCommand.prototype.execute = function(args) {
    context.system.check_key(args, "partner");
    context.system.check_key(args, "time");

    context.partners.deletePartner(args.partner, args.time);
};
