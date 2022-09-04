var UnlockCaseInfoQA = {};

UnlockCaseInfoQA.handle = function(case_id, time) {
    return {
        can_broadcast: context.partners.hasUnsendUnlockRequests(case_id, time),
        requests_required: context.partners.requiredUnlockRequests(case_id),
        requests_accepted: context.partners.unlockRequests(case_id),
        force_cost: QAHelper.map_cost(context.partners.unlockRequestCost(case_id))
    };
};
