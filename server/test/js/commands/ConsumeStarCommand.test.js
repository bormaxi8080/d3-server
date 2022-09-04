var helper = require('./../helper');
eval(helper.initContextCode());

describe('ConsumeStarCommand', function() {
    subject('command', function() {
        return new ConsumeStarCommand();
    });

    var initial_stars = 2;

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": { "active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "stars": initial_stars,
                }
            }
        });
    });

    describe('#execute', function() {
        it('should properly remove star', function() {
            this.command.execute(1);
            context.case.stars().should.equal(initial_stars - 1);
        });

        it('should throw LogicError on lack of stars', function () {
            var self = this;
            (function() {
                self.command.execute(3);
            }).should.throw(LogicError)
        });
    });
});

