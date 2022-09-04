var helper = require('./../helper');
eval(helper.initContextCode());

describe('ShopItemListQA', function() {
    subject('QA', function() {
        return ShopItemListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {});
            helper.sandbox.stub(definitions, "products", {
                "1000bucks": {
                    "group": "real_balance",
                    "presentation": {
                        "base_value": 1000,
                        "bonus": 25,
                        "total_value": 1250,
                        "name": "product.1000bucks.presentation.name",
                        "flag": "best_offer"
                    },
                    "shop": {
                        "cost": 99.99,
                        "id": "com.socialquantum.detective.1000bucks"
                    },
                    "reward": {
                        "real_balance": 1250,
                        "game_balance": 0
                    }
                },
                "200kdimes": {
                    "group": "game_balance",
                    "presentation": {
                        "base_value": 200000,
                        "bonus": 15,
                        "total_value": 230000,
                        "name": "product.200kdimes.presentation.name",
                        "flag": "hit_offer"
                    },
                    "shop": {
                        "cost": 19.99,
                        "id": "com.socialquantum.detective.200kdimes"
                    },
                    "reward": {
                        "real_balance": 0,
                        "game_balance": 230000
                    }
                }
            });
        });

        it('should return shop_item_list object', function() {
            this.QA.handle().should.deep.equal([{
                "name": "1000bucks",
                "type": "real_balance",
                "flag": "best_offer",
                "value": 1000,
                "bonus": "+ 25%",
                "totalValue": 1250
            },{
                "name": "200kdimes",
                "type": "game_balance",
                "flag": "hit_offer",
                "value": 200000,
                "bonus": "+ 15%",
                "totalValue": 230000
            }]);
        });
    });
});
