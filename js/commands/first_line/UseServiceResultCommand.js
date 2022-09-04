var UseServiceResultCommand = function() {
    this.services = new Services();
    this.services.add_executor("send_gift", new GiftService());
    this.services.add_executor("unlock_request", new UnlockRequestService());
    this.services.add_executor("payment", new PaymentService());
};

UseServiceResultCommand.toString = function() {
    return "use_service_result";
};

UseServiceResultCommand.prototype.execute = function(args) {
    context.system.check_key(args, "service_id");
    context.system.check_key(args, "operation_id");
    context.system.check_key(args, "result");
    context.system.check_key(args, "client_params");

    if (args.result.expires_date > 0 && args.time >= args.result.expires_date) {
        return;
    }

    this.services.use_result(args);
};
