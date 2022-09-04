var helper = require('./../../helper');
eval(helper.initContextCode());

describe('StartDayCommand', function() {
    subject('command', function() {
        return new StartDayCommand();
    });

    beforeEach(function() {
        this.timestamp = context.env.getTime();
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "player": {
                "hints": 3
            },
            "options": {
                "last_day_start": 10 * 24 * 3600 * 1000 + 3600 * 1000
            }
        });
    });

    describe('#execute', function() {
        describe('when start on next day', function() {
            var next_day = 11 * 24 * 3600 * 1000 + 3600 * 1000;
            it('should increment hints', function() {
                this.command.execute({time: next_day});
                context.storage.get_property("player.hints").should.equal(4);
            });
            it('should update last_day_start property', function() {
                this.command.execute({time: next_day});
                context.storage.get_property("options.last_day_start").should.equal(next_day);
            });
        });

        describe('when start two days after', function() {
            var second_day = 12 * 24 * 3600 * 1000 + 3600 * 1000;
            it('should reset hints', function() {
                this.command.execute({time: second_day});
                context.storage.get_property("player.hints").should.equal(1);
            });

            it('should update last_day_start property', function() {
                this.command.execute({time: second_day});
                context.storage.get_property("options.last_day_start").should.equal(second_day);
            });
        })
    });
});

