var ProcessHandler = function(core, next, safe) {
    this.core = core;
    this.next = next;
    this.safe = safe;
    this.logger = core.logger;
};

ProcessHandler.prototype.handle = function(task, callback) {
    var sessionData = task.data;
    var batch = task.batch;

    var network = this.core._cfg.findNetworkById(task.post.social_network);
    var result = this.core.batchRunnerFactory.get(task.post.script_version).run(network['name'], sessionData.getWorld(), sessionData.getUnusedServices(), batch);

    if (result.error) {
        if (task.is_init_request  && (result.error.type == 'DIFFERENT_HASHS')) {
            this.logger.warn('On Init:' + result.error.message);
        } else {
            this.logger.error("EPIC ERROR:", result.error.message);
            this.logger.error("error.stack:", result.error.stack);
            this.logger.error("result.changes:", result.changes);
            this.logger.error("result.used_services:", result.used_services);
        }

        if (!this.safe) {
            task.error = {
                error_code: "command_failed"
            };

            var additional_error_info = result.additional_error_info;
            if (additional_error_info) {
                for (var k in additional_error_info) {
                    task.error[k] = additional_error_info[k]
                }
            }

            return callback(null,  "error");
        }
    } else {
        //extract new service requests from changes
        var new_services = [];
        for (var c in result.createdServices) {
            var service_change = result.createdServices[c];
            var method = service_change.name;
            var social_id = service_change.value.target_id;
            if (social_id in this.core.config().app().npc_neighbours)
                continue;
            delete service_change.value.target_id;
            new_services.push({
                service_id: method,
                social_id: social_id,
                params: service_change.value
            });
        }

        //save only type="data" changes
        var filtered_changes = [];
        for (var i = 0; i < result.changes.length; i++) {
           var change = result.changes[i];
           if (change.type == "data") {
                filtered_changes.push(change);
           }
        }

        sessionData.setChanges(result.world, filtered_changes, new_services, result.used_services);
    }

    return callback(null, this.next);
};

module.exports = ProcessHandler;

