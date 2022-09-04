var MessageListQA = {};

MessageListQA.handle = function(services) {
    var res = [];
    if (services.send_gift) {
        res = res.concat(MessageListQA.format_messages("send_gift", services.send_gift));
    }
    if (services.unlock_request) {
        res = res.concat(MessageListQA.format_messages("unlock_request", services.unlock_request));
    }
    return res;
};

MessageListQA.format_messages = function(service_id, operations) {
    var res = []
    for (var operation_id in operations) {
        var operation = operations[operation_id];
        var result = operation.result;
        res.push({
            service_id: service_id,
            operation_id: parseInt(operation_id),
            partner_id: result.partner_id,
            button_color: MessageListQA.get_button_color(service_id, result),
            button_title: MessageListQA.get_button_title(service_id, result),
            img: MessageListQA.get_image(service_id, operation.result),
            count_text: MessageListQA.get_count(service_id, operation.result),
            text: MessageListQA.get_text(service_id, operation.result)
        });
    }
    return res;
};

MessageListQA.get_image = function(service_id, result) {
    if (service_id === "send_gift") {
        return context.defs.get_def(["interface.messages", service_id, result.type, "img"].join('.'));
    } else if (service_id === "unlock_request") {
        return context.defs.get_def("interface.messages." + service_id + ".img");
    }
}

MessageListQA.get_count = function(service_id, result) {
    if (service_id === "send_gift") {
        return "+" + result.count;
    } else {
        return "";
    }
};

MessageListQA.get_button_color = function(service_id, result) {
    if (service_id == "send_gift") {
        return context.defs.get_def(["interface.messages", service_id, result.type, "button_color"].join('.'));
    } else {
        return context.defs.get_def("interface.messages." + service_id + ".button_color");
    }
};

MessageListQA.get_button_title = function(service_id, result) {
    var type;
    if (service_id == "unlock_request") {
        type = (result.request ? "on_request" : "on_response");
    } else {
        type = result.type;
    }
    return context.defs.get_def(["interface.messages", service_id, type, "button_title"].join('.'));
};

MessageListQA.get_text = function(service_id, result) {
    var type;
    if (service_id == "unlock_request") {
        type = (result.request ? "on_request" : "on_response");
    } else {
        type = result.type;
    }
    return context.defs.get_def(["interface.messages", service_id, type, "text"].join('.'));
};
