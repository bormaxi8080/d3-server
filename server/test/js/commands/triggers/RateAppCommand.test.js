var helper = require('./../../helper');
eval(helper.initContextCode());

describe('RateAppCommand', function() {
    subject('command', function() {
        return new RateAppCommand();
    });

    var time = Date.now();
    beforeEach(function() {
        helper.setContextWorld(context, {
            "options": {
                "last_command_time": time + 1000,
                "rate":{
                    "time": time - 1000
                }
            }
        });
    });

    describe('#execute', function() {
        describe('when rate condition is satisfied', function() {
            beforeEach(function() {
                helper.sandbox.stub(context.options, "isRateConditionCompleted", function() {
                    return true;
                });
            });

            it('updates rate time', function() {
                this.command.execute();
                context.storage.get_property("options.rate.time").should.equal(time + 1000);
            });
        });
    });
});

