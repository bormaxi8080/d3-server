var helper = require('./../helper');
eval(helper.initContextCode());

describe('Options', function() {
    subject('options', function() {
        return context.options;
    });

    describe('#isRateConditionCompleted', function() {
        describe('when conditions completed', function () {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "player": {
                        "social_id": "100",
                        "level": 6
                    },
                    "open_cases": {
                        "case_02": {}
                    },
                    "options": {
                        "last_day_start": Date.now()
                    }
                });
            });

            it('returns true', function() {
                this.options.isRateConditionCompleted().should.be.true
            });
        });
    });
});
