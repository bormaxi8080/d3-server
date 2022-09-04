var helper = require('./../../helper');
eval(helper.initContextCode());

describe('BuyBoosterCommand', function() {
    subject('command', function() {
        return new BuyBoosterCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "player": {
                "boosters": {},
                "game_balance": 1000
            }
        });
        helper.sandbox.stub(definitions.boosters, "booster_types", {
            "quick_lookup": {
                "price": {
                    "game_balance": 500
                },
                "pack_size": 3
            }
        })
    });

    describe('#execute', function() {
        it('should add booster to player state', function() {
            this.command.execute({"booster_type": "quick_lookup"});
            context.storage.get_property("player.boosters.quick_lookup").should.equal(3);
        });
        it('should throw LogicError on incorrect booster type', function() {
            var self = this;
            (function() {
                self.command.execute({"booster_type": "IT'S ALL WRONGU"});
            }).should.throw(LogicError);

        });
        it('should consume money with player module', function() {
            var reduce_balance = helper.sandbox.stub(context.player, "reduce_balance");
            this.command.execute({"booster_type": "quick_lookup"});
            reduce_balance.should.have.been.calledWith({game_balance: 500});
        });
    });
});
