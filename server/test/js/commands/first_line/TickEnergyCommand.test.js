var helper = require('./../../helper');
eval(helper.initContextCode());

describe('TickEnergyCommand', function() {
    subject('command', function() {
        return new TickEnergyCommand();
    });

    var max_energy = 120;
    var increment_time = 10;
    var increment_prop = "player.energy.increment_time";

    beforeEach(function() {
        helper.sandbox.stub(definitions, "energy_settings", {
            "max_energy": max_energy,
            "energy_restore_time": increment_time
        });
    });

    describe('#execute', function() {
        it('should throw LogicError on unexpected tick', function() {
            helper.setContextWorld(context, {
                "player": {
                    "energy": {
                        "current": 12
                    }
                }
            });
            var self = this;
            (function() {
                self.command.execute({time: 100});
            }).should.throw(LogicError);
        });

        it('should increment energy', function() {
            var energy = 50
            helper.setContextWorld(context, {
                "player": {
                    "energy": {
                        "current": energy,
                        "increment_time": 1000
                    }
                }
            });
            this.command.execute({time: 5000});
            context.energy.get().should.equal(energy + 1);
        });

        describe('on max energy tick', function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "player": {
                        "energy": {
                            "current": max_energy - 1,
                            "increment_time": 1000
                        }
                    }
                });
            });
            it('should remove increment_time property', function() {
                this.command.execute({time: 5000});
                context.storage.has_property(increment_prop).should.be.false;
            });
        });

        describe('on some single tick', function() {
            var init_time = 1000;
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "player": {
                        "energy": {
                            "current": 50,
                            "increment_time": init_time
                        }
                    }
                });
            });
            describe('with default count value', function() {
                it('should update increment_time property', function() {
                    this.command.execute({time: 5000});
                    context.storage.get_property(increment_prop).should.be.equal(init_time + increment_time * 1000);
                });
            });

            describe('with custom count value', function() {
                it('should update increment_time property', function() {
                    this.command.execute({time: 91000, count: 10});
                    context.storage.get_property(increment_prop).should.be.equal(init_time + 10 * increment_time * 1000);
                });
            });

            describe('with max available count value', function() {
                it('should remove increment_time property', function() {
                    this.command.execute({time: 691000, count: 70});
                    context.storage.has_property(increment_prop).should.be.false;
                });
            });
        });
    });
});

