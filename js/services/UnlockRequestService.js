var UnlockRequestService = function() {}

UnlockRequestService.prototype.use_result = function(service_args, client_params, time) {
    context.system.check_key(client_params, "accept");

    if (!client_params.accept) return;

    context.system.check_key(service_args, "partner_id");
    context.system.check_key(service_args, "case_id");
    context.system.check_key(service_args, "request");

    var case_id = service_args.case_id;
    var partner_id = service_args.partner_id;
    if (service_args.request) {
        Executor.run(SendUnlockRequestCommand, partner_id, time, case_id, false);
    } else {
        context.partners.usePartnerUnlockRequest(partner_id, case_id);
    }
};
