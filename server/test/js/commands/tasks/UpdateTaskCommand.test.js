var helper = require('./../../helper');
eval(helper.initContextCode());

describe('UpdateTaskCommand', function() {
    subject('command', function() {
        return new UpdateTaskCommand();
    });

    describe('#execute', function() {
        var task = {"type": "type_1", "object_id": "object_1", "property": "value"};
        var updated_task = {"type": "type_1", "object_id": "object_1", "property": "value_2"};
        var update_fields = {"property": "value_2"};

        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": { "active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "tasks": [task]
                    }
                }
            });
        });

        it('should update task fields', function() {
            this.command.execute("type_1", "object_1", update_fields);
            context.case.tasks().should.deep.equal([updated_task]);
        });
    });
});
