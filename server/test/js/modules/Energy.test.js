var helper = require('./../helper');
eval(helper.initContextCode());
var expect = helper.expect;

describe('Energy', function() {
    subject('energy', function() {
        return context.energy;
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "player": {
                "energy": {
                    "current": 20,
                    "increment_time": 15000
                }
            }
        });

        helper.sandbox.stub(definitions, "energy_settings", {
            "max_energy": 40,
            "energy_restore_time": 10
        });
    });

    describe('#energy_restore_time', function() {
        it('returns time for restoring energy to max when no energy passed', function() {
            this.energy.energy_restore_time().should.equal(15000 + 19 * 10000);
        });

        describe('when energy passed', function() {
            it('returns null when passed value greater than max energy', function() {
                expect(this.energy.energy_restore_time(50)).to.be.null;
            });

            it('returns null when passed value less than current energy', function() {
                expect(this.energy.energy_restore_time(10)).to.be.null;
            });

            it('returns time for restoring energy', function() {
                this.energy.energy_restore_time(22).should.equal(15000 + 1 * 10000);
            });
        });
    });

    describe('#get_increment_time', function() {
        it('returns null when passed value greater than max energy', function() {
            expect(this.energy.get_increment_time(30)).to.be.null;
        });

        it('returns time for restoring exected energy count', function() {
            this.energy.get_increment_time(2).should.equal(15000 + 1 * 10000);
        });
    });

    describe('#get_increment_count', function() {
        it('returns 0 when current energy equal max', function() {
            helper.setContextWorld(context, {
                "player": {"energy": {"current": 40} }
            });
            this.energy.get_increment_count(20000).should.equal(0)
        });

        describe('when passed time is earlier than first increment_time', function() {
            it('returns 0', function() {
                this.energy.get_increment_count(12000).should.equal(0)
            });
        });

        it('returns count of energy which can be restored at time', function() {
            this.energy.get_increment_count(37000).should.equal(3);
        });

        it('limits return value with max_energy', function() {
            this.energy.get_increment_count(100000000).should.equal(20);
        });
    });
});
