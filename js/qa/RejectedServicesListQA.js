var RejectedServicesListQA = {};

RejectedServicesListQA.handle = function(services, time) {
    var res = [];
    for (var service_id in services) {
        res = res.concat(RejectedServicesListQA.reject_services(service_id, services[service_id], time));
    };
    return res;
};

RejectedServicesListQA.reject_services = function(service_id, operations, time) {
    var self = RejectedServicesListQA;
    var filtered = self.filter_expired_services(operations, time);
    for (var operation_id in operations) {
        var operation = operations[operation_id];
        var result = operation.result;

        if (service_id == "unlock_request" && filtered.indexOf(operation_id) < 0) {
            if (self.case_already_unlocked(result) || self.request_already_accepted(result)) {
                filtered.push(operation_id);
            } else {
                filtered = self.filter_duplicate_requests(filtered, operations, operation_id);
            }
        }
    }
    return filtered.map(function(operation_id) {
        return { service_id: service_id, operation_id: parseInt(operation_id) }
    });
};

RejectedServicesListQA.filter_expired_services = function(operations, time) {
    return Object.keys(operations).filter(function(operation_id) {
        return operations[operation_id].result.expires_date <= time;
    }).map(function(operation_id) {
        return operation_id;
    });
};

RejectedServicesListQA.is_result_duplicate = function(result_1, result_2) {
    return ['partner_id', 'case_id', 'request'].every(function(id) { return result_1[id] === result_2[id] });
};

RejectedServicesListQA.select_older_result = function(operation_id_1, result_1, operation_id_2, result_2) {
    return result_1.expires_date < result_2.expires_date ? operation_id_1 : operation_id_2
};

RejectedServicesListQA.case_already_unlocked = function(result) {
    return result.request == false && !context.case.isNew(result.case_id);
};

RejectedServicesListQA.request_already_accepted = function(result) {
    return context.partners.unlockRequests(result.case_id).indexOf(result.partner_id) >= 0;
};

RejectedServicesListQA.filter_duplicate_requests = function(filtered, operations, operation_id) {
    var self = RejectedServicesListQA;
    var result = operations[operation_id].result;
    for (var other_op_id in operations) {
        if (other_op_id != operation_id && filtered.indexOf(other_op_id) < 0) {
            var other_result = operations[other_op_id].result;
            if (self.is_result_duplicate(result, other_result)) {
                filtered.push(self.select_older_result(operation_id, result, other_op_id, other_result));
            }
        }
    }
    return filtered;
}
