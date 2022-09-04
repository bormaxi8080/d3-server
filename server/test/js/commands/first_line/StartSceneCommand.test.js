var helper = require('./../../helper');
eval(helper.initContextCode());

describe('StartSceneCommand', function() {
    subject('command', function() {
        return new StartSceneCommand();
    });

    beforeEach(function() {
        this.timestamp = context.env.getTime();
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "player": {
                "boosters": {
                    "quick_lookup": 1,
                    "full_hints": 1,
                    "full_multipliers": 0,
                    "highlight_timer": 1
                },
                "energy": { "current": 100 }
            },
            "immediate_data": {
                "active_case": "case_01"
            },
            "open_cases": {
                "case_01": {
                    "opened_scenes": {
                        "scene_1": {
                            "stars": 0
                        }
                    }
                }
            }
        });
    });

    describe('#execute', function() {
        describe("with partner", function() {
            it('should add start_scene in player state', function () {
                this.command.execute({scene: "scene_1", time: this.timestamp, boosters: [], partner: "partner_1", hints: 2});
                context.storage.get_property("immediate_data.active_scene").should.deep.equal({
                    scene_id: "scene_1",
                    start: this.timestamp,
                    active_boosters: [],
                    partner_id: "partner_1",
                    hints: 2
                });
            });

            it("should use partner", function() {
                this.command.execute({scene: "scene_1", time: this.timestamp, boosters: [], partner: "partner_1", hints: 1});
                this.executor.should.be.calledWith(UsePartnerCommand, "partner_1", this.timestamp);
            });

            it('should not withdraw full_hints booster if partner has full hints', function() {
                this.command.execute({scene: "scene_1", time: this.timestamp, boosters: ["full_hints"], partner: "partner_1", hints: 5});
                context.player.get_booster_count("full_hints").should.equal(1);
            });
        });

        describe("without partner", function() {
            it('should add start_scene in player state', function () {
                this.command.execute({ "scene": "scene_1", "time": this.timestamp, "boosters": [], hints: 1});
                context.storage.get_property("immediate_data.active_scene").should.deep.equal({
                    scene_id: "scene_1",
                    start: this.timestamp,
                    active_boosters: [],
                    hints: 1
                });
            });
        });


        it('should throw error then open invalid scene', function () {
            var self = this;
            (function () {
                self.command.execute({"scene": "incorrect_scene", "time": self.timestamp, "boosters": [], hints: 1});
            }).should.throw(LogicError);
        });

        describe("with 5 stars", function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "opened_scenes": {
                                "scene_1": {
                                    "stars": 5
                                }
                            }
                        }
                    }
                });
            });

            it('should throw LogicError when not enough energy', function () {
                context.storage.set_property("player.energy.current", 4);
                var self = this;
                (function () {
                    self.command.execute({ "scene": "scene_1", "time": self.timestamp, "boosters": [], hints: 1});
                }).should.throw(LogicError);
            });

            it('should remove valid amount of energy', function () {
                context.storage.set_property("player.energy.current", 25);
                this.command.execute({ "scene": "scene_1", "time": this.timestamp, "boosters": [], hints: 1});
                context.energy.get().should.equal(20);
            });
        });

        describe("with less than 5 stars", function() {
            beforeEach(function() {
                helper.setContextWorld(context, {
                    "immediate_data": {
                        "active_case": "case_01"
                    },
                    "open_cases": {
                        "case_01": {
                            "opened_scenes": {
                                "scene_1": {
                                    "stars": 3
                                }
                            }
                        }
                    }
                });
            });

            it('should throw LogicError when not enough energy', function () {
                context.storage.set_property("player.energy.current", 19);
                var self = this;
                (function () {
                    self.command.execute({ "scene": "scene_1", "time": self.timestamp, "boosters": [], hints: 1});
                }).should.throw(LogicError);
            });

            it('should remove valid amount of energy', function () {
                context.storage.set_property("player.energy.current", 25);
                this.command.execute({ "scene": "scene_1", "time": this.timestamp, "boosters": [], hints: 1});
                context.energy.get().should.equal(5);
            });
        });

        it('should add valid boosters to active_scene', function() {
            this.command.execute({ "scene": "scene_1", "time": this.timestamp, "boosters": ["quick_lookup", "full_hints"], hints: 1});
            var scene = context.storage.get_property("immediate_data.active_scene");
            var active_boosters = scene.active_boosters;
            active_boosters.should.contain("quick_lookup");
            active_boosters.should.contain("full_hints");
            active_boosters.should.not.contain("full_multipliers");
        });

        it('should withdraw all valid boosters from player', function() {
            this.command.execute({ "scene": "scene_1", "time": this.timestamp, "boosters": ["quick_lookup", "full_hints"], hints: 1});
            context.player.get_booster_count("quick_lookup").should.equal(0);
            context.player.get_booster_count("full_hints").should.equal(0);
            context.player.get_booster_count("highlight_timer").should.equal(1);
        });

        it("should throw error on attempt to use more than three boosters", function() {
            var self = this;
            (function () {
                self.command.execute({ "scene": "scene_1", "time": self.timestamp, "boosters": ["quick_lookup", "full_hints", "full_multipliers", "highlight_timer"], hints: 1});
            }).should.throw(LogicError);
        });
    });
});

