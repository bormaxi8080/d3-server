function Partners() { };

Partners.prototype.partnerProp = function(partner_id, fake) {
    if (fake) {
        return (partner_id ? "fake_partners." + partner_id : "fake_partners");
    } else {
        return (partner_id ? "partners." + partner_id : "partners");
    }
};

Partners.prototype.partner = function(partner_id, is_fake) {
    return context.storage.get_property(this.partnerProp(partner_id, is_fake));
};

Partners.prototype.hasPartner = function(partner_id, is_fake) {
    return context.storage.has_property(this.partnerProp(partner_id, is_fake));
};

Partners.prototype.invitePartner = function(partner_id, time) {
    if (context.storage.get_property("player.social_id") == partner_id) {
        throw new LogicError("Нельзя добавить себя в партнеры\npartner_id: " + partner_id);
    }

    if (this.hasPartner(partner_id)) {
        throw new LogicError("Игрок с указаным идентификатором уже является партнером\npartner_id: " + partner_id);
    } else {
        context.storage.set_property(this.partnerProp(partner_id), {
            ready_time: time,
            unlocks: {}
        });
    }
};

Partners.prototype.deletePartner = function(partner_id, time) {
    if (context.storage.get_property("player.social_id") == partner_id) {
        throw new LogicError("Нельзя удалить себя из партнеров\npartner_id: " + partner_id);
    }

    if (this.hasPartner(partner_id)) {
        this.deleteUsedRequestsByPartner(partner_id);
        context.storage.set_property(this.partnerProp(partner_id), null);
    } else {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }
};

Partners.prototype.resetTime = function(partner_id, is_fake) {
    if (is_fake) {
        return this.fakePartner(partner_id).reset_time;
    } else {
        return context.defs.get_def("partner_settings").reset_time;
    }
}

Partners.prototype.usePartner = function(partner_id, time) {
    var is_fake = this.isFake(partner_id);
    if (is_fake || this.hasPartner(partner_id)) {
        var ready_time_prop = this.partnerProp(partner_id, is_fake) + ".ready_time";
        var use_time_prop = this.partnerProp(partner_id, is_fake) + ".use_time";

        var ready_time = 0;
        if (context.storage.has_property(ready_time_prop)) {
            ready_time = context.storage.get_property(ready_time_prop);
        }
        if (ready_time > time) {
            throw new LogicError("Использовать партнера еще нельзя\npartner_id: " + partner_id + "; " + time + " < " + ready_time);
        }

        context.storage.set_property(ready_time_prop, time + this.resetTime(partner_id, is_fake) * 1000);
        context.storage.set_property(use_time_prop, time);
    } else {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }
};

Partners.prototype.calculateResetCost = function(seconds) {
    return Math.ceil(seconds / context.defs.get_def("partner_settings.reset_partner_seconds_per_cash"));
};

Partners.prototype.resetPartner = function(partner_id, time) {
    var is_fake = this.isFake(partner_id);
    if (this.hasPartner(partner_id, is_fake)) {
        var ready_time_prop = this.partnerProp(partner_id, is_fake) + ".ready_time";
        var delta_time = context.storage.get_property(ready_time_prop) - time;
        if (delta_time > 0) {
            var reset_cost = this.calculateResetCost(delta_time / 1000)
            context.player.reduce_real_balance(reset_cost);
            context.storage.set_property(ready_time_prop, time);
            context.track.speedup("partner_reset", {real_balance: reset_cost});
        }
    } else {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }
};

Partners.prototype.unlockRequestsProp = function(case_id) {
    return "new_cases." + case_id + ".unlock_requests";
};

Partners.prototype.unlockRequests = function(case_id) {
    var prop = this.unlockRequestsProp(case_id);
    if (context.storage.has_property(prop)) {
        return context.storage.get_property(prop);
    } else {
        return [];
    }
};

Partners.prototype.usePartnerUnlockRequest = function(partner_id, case_id) {
    context.case.checkDefined(case_id);

    if (!this.hasPartner(partner_id)) {
        throw new LogicError("Игрок с указаным идентификатором не является партнером\npartner_id: " + partner_id);
    }

    if (!context.case.isNew(case_id)) { return; }

    var unlock_requests_prop = this.unlockRequestsProp(case_id);
    var unlock_requests = this.unlockRequests(case_id);
    if (unlock_requests.indexOf(partner_id) >= 0) {
        throw new LogicError("Реквест на открытие дела от игрока уже принят\npartner_id: " + partner_id + " case_id: " + case_id);
    } else {
        if (this.isFake(partner_id)) {
            throw new LogicError("Невозможно использовать запрос от фейкового партнера\npartner_id: " + partner_id + " case_id: " + case_id);
        } else {
            unlock_requests.push(partner_id);
            context.storage.set_property(unlock_requests_prop, unlock_requests);
        }
    }
};

Partners.prototype.leftUnlockRequest = function(case_id) {
    return this.requiredUnlockRequests(case_id) - this.unlockRequests(case_id).length;
};

Partners.prototype.unlockRequestCost = function(case_id) {
    var left_requests = this.leftUnlockRequest(case_id);
    if (left_requests > 0) {
        return {
            real_balance: left_requests * context.defs.get_def("partner_settings.unlock_cost_per_request")
        };
    } else {
        return {};
    }
};

Partners.prototype.requiredUnlockRequests = function(case_id) {
    return context.defs.get_def("partner_settings.unlock_requests_required");
};

Partners.prototype.unsendUnlockRequestPartners = function(case_id, time) {
    var res = [];
    var unlock_interval = context.defs.get_def("partner_settings.unlock_repeat_interval") * 1000;
    var partners = this.partner();
    var requests = this.unlockRequests(case_id);
    for (var partner_id in partners) {
        var case_unlock = partners[partner_id].unlocks[case_id];
        if ((!case_unlock || case_unlock + unlock_interval < time) && requests.indexOf(partner_id) < 0) {
            res.push(partner_id);
        }
    }
    return res;
};

Partners.prototype.partnerUnlocksProp = function(partner_id, case_id) {
    return this.partnerProp(partner_id) + ".unlocks." + case_id;
};

Partners.prototype.hasUnsendUnlockRequests = function(case_id, time) {
    return this.unsendUnlockRequestPartners(case_id, time).length > 0;
};

Partners.prototype.broadcastUnlockRequests = function(case_id, time) {
    var self = this;
    this.unsendUnlockRequestPartners(case_id, time).map(function(partner_id) {
        Executor.run(SendUnlockRequestCommand, partner_id, time, case_id, true);
        context.storage.set_property(self.partnerUnlocksProp(partner_id, case_id), time);
    });
};

Partners.prototype.cleanupUnlockRequests = function(case_id) {
    var partners = this.partner();
    var requests = this.unlockRequests(case_id);
    for (var partner_id in partners) {
        if (partners[partner_id].unlocks[case_id]) {
            context.storage.set_property(this.partnerUnlocksProp(partner_id, case_id), null);
        }
    }
};

Partners.prototype.deleteUsedRequestsByPartner = function(partner_id) {
    var new_cases = context.storage.get_property("new_cases");
    for (var case_id in new_cases) {
        var unlock_requests = this.unlockRequests(case_id);
        var unlock_requests_index = unlock_requests.indexOf(partner_id);
        if (unlock_requests_index >= 0) {
            unlock_requests.splice(unlock_requests_index, 1);
            context.storage.set_property(this.unlockRequestsProp(case_id), unlock_requests);
        };
    }
};

Partners.prototype.fakePartnerProp = function(fake_partner_id) {
    return (fake_partner_id ? "partner_fakes.partners." + fake_partner_id : "partner_fakes.partners");
};

Partners.prototype.fakePartner = function(fake_partner_id) {
    return context.defs.get_def(this.fakePartnerProp(fake_partner_id));
};

Partners.prototype.isFake = function(partner_id) {
    return context.defs.has_def(this.fakePartnerProp(partner_id));
};
