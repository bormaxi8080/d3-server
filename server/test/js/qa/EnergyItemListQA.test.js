var helper = require('./../helper');
eval(helper.initContextCode());

describe('EnergyItemListQA', function() {
    subject('QA', function() {
        return EnergyItemListQA;
    });

    describe("#handle", function() {
        beforeEach(function() {
            helper.sandbox.stub(definitions.packs, "pack_types", {
                "item_4_pack": {
                    "name": "items.item_4.name",
                    "description": "items.item_4.description",
                    "img": "images/icon_coffee_cup_04.png",
                    "discount": 25,
                    "price": {
                        "real_balance": 100
                    },
                    "content": {
                        "item_4": 3
                    }
                },
                "item_4_single": {
                    "name": "items.item_4.name",
                    "description": "items.item_4.description",
                    "img": "images/icon_coffee_cup_04.png",
                    "discount": 0,
                    "price": {
                        "real_balance": 100
                    },
                    "content": {
                        "item_4": 1
                    }
                }
            });

            helper.sandbox.stub(definitions.items, "item_types", {
                "item_1": {
                    "name": "items.item_1.name",
                    "description": "items.item_1.description",
                    "img": "images/icon_coffee_cup_01.png",
                    "energy": 20,
                    "require": {
                        "medal": "silver",
                        "star": 1
                    }
                },
                "item_4": {
                    "name": "items.item_4.name",
                    "description": "items.item_4.description",
                    "img": "images/icon_coffee_cup_04.png",
                    "energy": 250,
                    "require": {
                        "medal": "gold",
                        "star": 5
                    }
                }
            });
        });

        it('should return  energy_item_list object', function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                },
                "player":{
                    "inventory": {
                        "item_1": 1,
                        "item_3": 1

                    }
                },
                "open_cases": {
                    "case_01": {
                        "status": "open",
                        "tasks": [{
                            "type": "buy_item",
                            "object_id": "item_1",
                        }, {
                            "type": "buy_item",
                            "object_id": "item_2",
                        }, {
                            "type": "buy_item",
                            "object_id": "item_3",
                        }, {
                            "type": "earn_stars",
                            "object_id": "default",
                        }]
                    }
                }
            });

            this.QA.handle().should.deep.equal([{
                "id": "item_1",
                "type": "item",
                "discount": "",
                "name": "items.item_1.name",
                "image": "images/icon_coffee_cup_01.png",
                "description": "items.item_1.description",
                "cost": "",
                "value": 20,
                "count": 1
            }, {
                "id": "item_4",
                "type": "item",
                "discount": "",
                "name": "items.item_4.name",
                "image": "images/icon_coffee_cup_04.png",
                "description": "items.item_4.description",
                "cost": "",
                "value": 250,
                "count": 0
            }, {
                "id": "item_4_pack",
                "type": "pack",
                "discount": "-25%",
                "name": "items.item_4.name",
                "image": "images/icon_coffee_cup_04.png",
                "description": "items.item_4.description",
                "cost": "100$",
                "value": 250,
                "count": 3
            }, {
                "id": "item_4_single",
                "type": "pack",
                "discount": "",
                "name": "items.item_4.name",
                "image": "images/icon_coffee_cup_04.png",
                "description": "items.item_4.description",
                "cost": "100$",
                "value": 250,
                "count": 1
            }]);
        });
    });
});
