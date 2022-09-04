var helper = require('./../helper');
eval(helper.initContextCode());

describe('AddXpCommand', function() {
    var time = Date.now();

    var reward_1 = { "game_balance": 100 }
    var reward_2 = { "game_balance": 200 }
    var reward_3 = { "game_balance": 300 }

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "player": {
                "exp": 0,
                "level": 1,
                "energy": {
                    "current": 40,
                    "increment_time": 1000
                }
            },
            "options": {
                "last_command_time": time
            },
            "partners": {
                "partner_1": {},
                "partner_2": {}
            }
        });
        helper.sandbox.stub(definitions.levels, "levels_list", [{
            "required_xp": 0,
            "reward": {}
        }, {
            "required_xp": 100,
            "reward": reward_1
        }, {
            "required_xp": 200,
            "reward": reward_2
        }, {
            "required_xp": 300,
            "reward": reward_3
        }]);
    })

    subject('command', function() {
        return new AddXpCommand();
    });

    describe('#execute', function() {
        it('should properly add xp', function() {
            this.command.execute(50);
            context.player.get_xp().should.equal(50);
            this.command.execute(40);
            context.player.get_xp().should.equal(90);
        });

        it('should properly raise level', function() {
            this.command.execute(100);
            context.player.get_level().should.equal(2);
        });

        it('should substract expirence', function () {
            this.command.execute(110);
            context.player.get_xp().should.equal(10);
        });

        it('should properly raise n levels', function () {
            this.command.execute(500);
            context.player.get_xp().should.equal(200);
            context.player.get_level().should.equal(3);
        });


        it('should give awards on raising n levels', function () {
            this.command.execute(500);
            this.executor.should.have.been.calledWith(ApplyRewardCommand, reward_1);
            this.executor.should.have.been.calledWith(ApplyRewardCommand, reward_2);
            this.executor.should.not.have.been.calledWith(ApplyRewardCommand, reward_3);
        });

        it('should limit xp at level cap', function () {
            this.command.execute(700);
            context.player.get_xp().should.equal(0);
            context.player.get_level().should.equal(4);
        });

        it('should reset energy to max on levelup', function() {
            this.command.execute(120);
            context.energy.get().should.equal(context.energy.get_max());
        });

        it('should send energy gift to all partners on levelup', function(){
            this.command.execute(100);
            this.executor.should.have.been.calledWith(SendGiftCommand, "partner_1", time, "levelup", 1, {items: {item_1 : 1}});
            this.executor.should.have.been.calledWith(SendGiftCommand, "partner_2", time, "levelup", 1, {items: {item_1 : 1}});
        });

        it('should throw multimple events on multiple levels raised', function() {
            helper.setContextWorld(context, {
                "player": {
                    "exp": 50,
                    "level": 1,
                    "energy": {
                        "current": 40,
                        "increment_time": 1000
                    }
                },
                "options": {
                    "last_command_time": time
                },
                "partners": {}
            });

            this.animate = helper.sandbox.stub(context.events, "animate");
            this.command.execute(323);
            this.animate.should.be.calledWith("exp", 50, 100);
            this.animate.should.be.calledWith("exp", 0, 200);
            this.animate.should.be.calledWith("exp", 0, 73);
        })
    });
});
