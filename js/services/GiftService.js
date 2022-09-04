var GiftService = function() {}

GiftService.prototype.use_result = function(service_args, client_params, time) {
    context.system.check_key(client_params, "accept");

    if (!client_params.accept) return;

    context.system.check_key(service_args, "partner_id");
    context.system.check_key(service_args, "type");
    context.system.check_key(service_args, "count");
    context.system.check_key(service_args, "content");

    if (service_args.content.energy) {
        context.energy.add(service_args.content.energy);
    }

    if (service_args.content.items) {
        for (var item in service_args.content.items) {
            Executor.run(AddItemCommand, item, service_args.content.items[item]);
        }
    }
};
