var PaymentService = function() { };

PaymentService.prototype.use_result = function(service_args, client_params, time) {
    context.system.check_key(client_params, "accept");
    if (!client_params.accept) return;

    context.system.check_key(service_args, "product_id");
    context.system.check_key(service_args, "store");

    var product_id = service_args.product_id;
    var product_defs = context.defs.get_def("products");
    var product = product_defs[product_id];

    var store_data = product.store[service_args.store];
    if (product) {
        Executor.run(ApplyRewardCommand, product.reward);
        context.track.in_app(product_id, product.reward);
        context.track.revenue(service_args.store, store_data.id, store_data.cost);
    } else {
        throw new LogicError("Неизвестный продукт: " + product_code);
    }
};

