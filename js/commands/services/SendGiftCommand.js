var SendGiftCommand = function() {};

SendGiftCommand.toString = function() {
    return "send_gift";
};

SendGiftCommand.prototype.execute = function(partner_id, time, type, count, content) {
    if (!context.defs.has_def("interface.messages.send_gift." + type)) {
        throw new LogicError("Неизвестный тип подарка!\ntype: " + type);
    }

    if (!count) {
        throw new LogicError("Не указано поле count в подарке!\npartner_id: " + partner_id);
    }

    if (!content) {
        throw new LogicError("Не указано содержимое подарка!\npartner_id: " + partner_id);
    }

    if (!context.partners.isFake(partner_id)) {
        context.env.createService("send_gift", {
            target_id: partner_id,
            partner_id: context.storage.get_property("player.social_id"),
            type: type,
            count: count,
            content: content,
            expires_date: time + context.get_service_expire_interval()
        });
    }
};
