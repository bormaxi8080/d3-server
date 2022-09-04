var helper = require('./../../helper');
eval(helper.initContextCode());

describe('DropActiveSceneCommand', function() {
    subject('command', function() {
        return new DropActiveSceneCommand();
    });

    describe('#execute', function() {
        it('should delete active_scene property from immediate_data', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_scene": { }
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

