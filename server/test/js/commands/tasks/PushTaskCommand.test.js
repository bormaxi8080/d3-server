var helper = require('./../../helper');
eval(helper.initContextCode());

describe('PushTaskCommand', function() {
    subject('command', function() {
        return new PushTaskCommand();
    });

    describe('#execute', function() {
        var task = {"type": "type_1", "object_id": "object_1"};
        var new_task = {"type": "type_1", "object_id": "object_2"};
        var dup_task = {"type": "type_1", "object_id": "object_1"};
        var incorrect_task = {"type": "type_2"};

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

        it('should add new task', function() {
            this.command.execute(new_task);
            context.case.tasks().should.deep.equal([task, new_task]);
        });

        it('should throw on incorect task format', function() {
            var self = this;
            (function() {
                self.command.execute(incorrect_task);
            }).should.throw(AccessProtocolError);
        });

        it('should throw on duplicate task', function() {
            var self = this;
            (function() {
                self.command.execute(dup_task);
            }).should.throw(LogicError);
        });
    });
});
