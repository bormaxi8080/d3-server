var SendUnlockRequestCommand = function() {};

SendUnlockRequestCommand.toString = function() {
    return "send_unlock_request";
};

SendUnlockRequestCommand.prototype.execute = function(partner_id, time, case_id, request) {
    if (!context.partners.isFake(partner_id)) {
        context.env.createService("unlock_request", {
            target_id: partner_id,
            partner_id: context.storage.get_property("player.social_id"),
            case_id: case_id,
            request: request,
            expires_date: time + context.get_service_expire_interval()
        });
    }
};
