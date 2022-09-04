var helper = require('./../../helper');
eval(helper.initContextCode());

describe('ProgressTutorialCommand', function() {
    subject('command', function() {
        return new ProgressTutorialCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.sandbox.stub(definitions.tutorial, "steps", [
            "step_1",
            "step_2",
            "step_3"
        ]);
    })

    describe('#execute', function() {
        it('should switch tutorial step to next one', function() {
            helper.setContextWorld(context, {
                "tutorial": {"state": "step_1"},
                "options": {
                    "init_time": 10,
                    "last_command_time": 20
                },
            });

            this.command.execute();
            context.storage.get_property("tutorial.state").should.be.equal("step_2");
        });

        it('should remove tutorial on last step', function() {
            helper.setContextWorld(context, {
                "tutorial": {"state": "step_3"},
                "options": {
                    "init_time": 10,
                    "last_command_time": 20
                },
            });

            this.command.execute();
            context.storage.has_property("tutorial").should.be.false;
        });

        it('should throw LogicError if tutorial step does not exists', function() {
            helper.setContextWorld(context, {
                "tutorial": {"state": "step_xxx"}
            });

            var self = this;
            (function() {
                self.command.execute();
            }).should.throw(LogicError);
        });
    });
});
