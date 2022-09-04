var helper = require('./../../helper');
eval(helper.initContextCode());

describe('DeleteTasksCommand', function() {
    subject('command', function() {
        return new DeleteTasksCommand();
    });

    describe('#execute', function() {
        var task_1 = {"type": "type_1", "object_id": "object_1"};
        var task_2 = {"type": "type_1", "object_id": "object_2"};
        var task_3 = {"type": "type_2", "object_id": "object_3"};
        var task_3_dup = {"type": "type_2", "object_id": "object_3"};
        var task_4 = {"type": "type_2", "object_id": "object_4"};

        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": { "active_case": "case_01"},
                "open_cases": {
                    "case_01": {
                        "tasks": [task_1, task_2, task_3, task_3_dup, task_4]
                    }
                }
            });
        });

        it('should throw if no type passed', function() {
            var self = this;
            (function() {
                self.command.execute();
            }).should.throw(AccessProtocolError);
        });

        it('should remove tasks by type, if no object_id passed', function() {
            this.command.execute("type_1");
            context.case.tasks().should.deep.equal([task_3, task_3_dup, task_4]);
        });

        it('should remove tasks by type and object_id', function() {
            this.command.execute("type_2", "object_3");
            context.case.tasks().should.deep.equal([task_1, task_2, task_4]);
        });

    });
});

