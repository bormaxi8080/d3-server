var helper = require('../../helper');
eval(helper.initContextCode());

describe('UseItemCommand', function() {
    subject('command', function() {
        return new UseItemCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "player": {
                "inventory": {
                    "item_1": 34
                },
                "energy": {
                    "current": 1
                }
            }
        });
        helper.sandbox.stub(definitions.items, "item_types", {
            "item_1": {
                "energy": 55
            }
        })
    });

    it('should add energy', function() {
        this.command.execute({"item_type": "item_1"});
        context.energy.get().should.equal(56);
    });

    it('should withdraw an item from inventory', function() {
        this.command.execute({"item_type": "item_1"});
        context.storage.get_property("player.inventory.item_1").should.equal(33);
    });
});