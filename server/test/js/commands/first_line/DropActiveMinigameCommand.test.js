var helper = require('./../../helper');
eval(helper.initContextCode());

describe('DropActiveMinigameCommand', function() {
    subject('command', function() {
        return new DropActiveMinigameCommand();
    });

    describe('#execute', function() {
        it('should delete active_scene property from immediate_data', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_minigame": { }
                }
            });
            this.command.execute({});
            context.storage.get_property("immediate_data").should.deep.equal({});
        });
        it('should not throw LogicError if no active_scene found', function() {
            helper.setContextWorld(context, {"immediate_data": {} });
            var self = this;
            (function() {
                self.command.execute({});
            }).should.not.throw(LogicError);
        });
    });
});

