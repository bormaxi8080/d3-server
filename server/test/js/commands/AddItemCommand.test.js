var helper = require('./../helper');
eval(helper.initContextCode());

describe('AddItemCommand', function() {

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "player": {
                "items": {
                    "item_0": 0
                }
            }
        });
        helper.sandbox.stub(definitions.items, "item_types", {
            item_0 : {}
        });
    });

    subject('command', function() {
        return new AddItemCommand();
    });

    it('should throw error if item type does not exists', function() {
        var self = this;
        (function() {
            self.command.execute("unknown_item", 1);
        }).should.throw(Error);
    });

    it('should properly add items by type', function() {
        this.command.execute("item_0", 2);
        context.player.get_item_count("item_0").should.equal(2);
    });
});