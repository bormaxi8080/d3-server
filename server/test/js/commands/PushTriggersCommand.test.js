var _ = require('underscore');
var helper = require('./../helper');
eval(helper.initContextCode());

describe('PushTriggersCommand', function() {
    subject('command', function() {
        return new PushTriggersCommand();
    });

    describe('#execute', function() {
        var trigger = { "trigger": "value" }
        var other_trigger = { "other_trigger": "other_value" }

        it('should correctly set triggers to case', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "triggers": { }
                },
            });
            this.command.execute([trigger]);
            context.storage.get_property("immediate_data.triggers.case_01").should.be.deep.equal([trigger]);
        });

        it('should append triggers', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01",
                    "triggers": {
                        "case_01": [trigger]
                    }
                },
            });
            this.command.execute([other_trigger]);
            context.storage.get_property("immediate_data.triggers.case_01").should.be.deep.equal([trigger, other_trigger]);
        });

        it('should fail if null value passed in triggers', function() {
            var self = this;
            (function() {
                self.command.execute([null])
            }).should.throw(LogicError);
        });

        it('should fail if non-array value passed', function() {
            var self = this;
            (function() {
                self.command.execute(null)
            }).should.throw(LogicError);
        });
    });
});
