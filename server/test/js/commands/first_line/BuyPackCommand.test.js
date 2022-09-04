var helper = require('../../helper');
eval(helper.initContextCode());

describe('BuyPackCommand', function() {
    subject('command', function() {
        return new BuyPackCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "player": {
                "inventory": {
                    "item_1": 1
                },
                "real_balance": 1000
            }
        });
        helper.sandbox.stub(definitions.items, "item_types", {
            "item_1": {
                "price": {
                    "real_balance": 100
                }
            },
            "item_2": {
                "price": {
                    "real_balance": 10
                }
            },
        });

        helper.sandbox.stub(definitions.packs, "pack_types", {
            "item_1_pack": {
                "price": {
                    "real_balance": 100
                },
                "content": {"item_1":3, "item_2":1}
            }
        });
    });

    it('should increase amount in inventory', function() {
        this.command.execute({"pack_type": "item_1_pack"});
        context.player.get_item_count("item_1").should.equal(4);
    });

    it('should buy whole pack', function() {
        this.command.execute({"pack_type": "item_1_pack"});
        context.player.get_item_count("item_1").should.equal(4);
        context.player.get_item_count("item_2").should.equal(1);
    });

    it('should withdraw money', function() {
        this.command.execute({"pack_type": "item_1_pack"});
        context.storage.get_property("player.real_balance").should.equal(900);
    });

    it('should throw error on insufficient funds', function() {
        helper.setContextWorld(context, {
            "player": {
                "inventory": {
                    "item_1": 1
                },
                "real_balance": 60
            }
        });

        var self = this;
        (function() {
            self.command.execute({"pack_type": "item_1_pack"});
        }).should.throw(Error);
    });
});

