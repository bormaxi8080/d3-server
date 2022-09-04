var helper = require('./../helper');
eval(helper.initContextCode());

describe('BoosterListQA', function() {
    subject('QA', function() {
        return BoosterListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "player": {
                    "boosters": {
                        "quick_lookup": 10
                    }
                },
                "immediate_data": {
                    "active_case": "case_01"
                }
            });
        });

        it('should return list of boosters items', function() {
            this.QA.handle("scene_1").should.deep.equal([{
                name: 'quick_lookup',
                supported: true,
                title: 'boosters.booster_types.quick_lookup.name',
                description: 'boosters.booster_types.quick_lookup.description',
                img: 'images/icon_booster_cooldown',
                tooltip: 'boosters.tooltip',
                cost: '500#',
                packSize: 3,
                count: 10
            }, {
                name: 'full_hints',
                supported: true,
                title: 'boosters.booster_types.full_hints.name',
                description: 'boosters.booster_types.full_hints.description',
                img: 'images/icon_booster_five',
                tooltip: 'boosters.tooltip',
                cost: '1500#',
                packSize: 3,
                count: 0
            }, {
                name: 'full_multiplier',
                supported: false,
                title: 'boosters.booster_types.full_multiplier.name',
                description: 'boosters.booster_types.full_multiplier.description',
                img: 'images/icon_booster_x6',
                tooltip: 'boosters.tooltip',
                cost: '3000#',
                packSize: 3,
                count: 0
            }, {
                name: 'minimal_multiplier',
                supported: true,
                title: 'boosters.booster_types.minimal_multiplier.name',
                description: 'boosters.booster_types.minimal_multiplier.description',
                img: 'images/icon_booster_x3',
                tooltip: 'boosters.tooltip',
                cost: '3$',
                packSize: 3,
                count: 0
            }, {
                name: 'highlight_timer',
                supported: true,
                title: 'boosters.booster_types.highlight_timer.name',
                description: 'boosters.booster_types.highlight_timer.description',
                img: 'images/icon_booster_5sec',
                tooltip: 'boosters.tooltip',
                cost: '2$',
                packSize: 3,
                count: 0
            }]);
        });

        it('should return reduced list of boosters items for puzzle scene', function() {
            helper.sandbox.stub(definitions.cases.case_01, "scenes", {
                "scene_1": {
                    "type": "puzzle"
                }
            });

            this.QA.handle("scene_1").should.deep.equal([{
                name: 'quick_lookup',
                supported: false,
                title: 'boosters.booster_types.quick_lookup.name',
                description: 'boosters.booster_types.quick_lookup.description',
                img: 'images/icon_booster_cooldown',
                tooltip: 'boosters.tooltip',
                cost: '500#',
                packSize: 3,
                count: 10
            }, {
                name: 'full_hints',
                supported: true,
                title: 'boosters.booster_types.full_hints.name',
                description: 'boosters.booster_types.full_hints.description',
                img: 'images/icon_booster_five',
                tooltip: 'boosters.tooltip',
                cost: '1500#',
                packSize: 3,
                count: 0
            }, {
                name: 'full_multiplier',
                supported: false,
                title: 'boosters.booster_types.full_multiplier.name',
                description: 'boosters.booster_types.full_multiplier.description',
                img: 'images/icon_booster_x6',
                tooltip: 'boosters.tooltip',
                cost: '3000#',
                packSize: 3,
                count: 0
            }, {
                name: 'minimal_multiplier',
                supported: true,
                title: 'boosters.booster_types.minimal_multiplier.name',
                description: 'boosters.booster_types.minimal_multiplier.description',
                img: 'images/icon_booster_x3',
                tooltip: 'boosters.tooltip',
                cost: '3$',
                packSize: 3,
                count: 0
            }, {
                name: 'highlight_timer',
                supported: false,
                title: 'boosters.booster_types.highlight_timer.name',
                description: 'boosters.booster_types.highlight_timer.description',
                img: 'images/icon_booster_5sec',
                tooltip: 'boosters.tooltip',
                cost: '2$',
                packSize: 3,
                count: 0
            }]);
        });
    });
});
