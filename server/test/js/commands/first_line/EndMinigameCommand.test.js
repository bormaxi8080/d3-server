var helper = require('./../../helper');
eval(helper.initContextCode());

describe('EndMinigameCommand', function() {
    subject('command', function() {
        return new EndMinigameCommand();
    });

    var on_complete = [{"some_trigger": "some_value"}]

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01",
                "active_minigame": {
                    "forensic_item": "forensic_item_1",
                    "start": 10000
                }
            },
            "open_cases": {
                "case_01": {
                    "found_forensic_items": {
                        "forensic_item_1": {
                            "state": "state_1"
                        }
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases.case_01, "forensic_items", {
            "forensic_item_1": {
                "states": {
                    "state_1": {
                        "minigame": {
                            "type": "puzzle",
                            "next_state": "state_2",
                            "on_complete": on_complete,
                            "data": {
                                "type": "type_1"
                            }
                        }
                    },
                    "state_2": {}
                }
            }
        });

        helper.sandbox.stub(definitions.energy_settings, "minigame_start_energy", 9);

        this.executor = helper.sandbox.stub(Executor,"run");
        this.energy = helper.sandbox.stub(context.energy, "add");
    });

    describe('#execute', function() {
        beforeEach(function() {
            this.minigame_cost = context.case.minigameCost("forensic_item_1");

            helper.sandbox.stub(definitions.energy_settings, "minigame_fade_time", 10);
            helper.sandbox.stub(definitions.energy_settings, "minigame_start_energy", 9);
        })

        it('delete immediate_data.active_minigame from storage', function() {
            this.command.execute({energy: 9, time: 10030});
            context.storage.has_property(context.case.activeMinigameProp).should.be.false;
        });

        it('should add expected amount energy', function() {
            this.command.execute({energy: 5, time: 10030});
            this.energy.should.have.been.calledWith(5);
        });

        it('should throw if energy exceeds minigame_start_energy', function() {
            var self = this;
            (function() {
                self.command.execute({energy: 11, time: 10030});
            }).should.throw(LogicError);
        });

        it('should consume star', function() {
            this.command.execute({energy: 9, time: 10030});
            this.executor.should.have.been.calledWith(ConsumeStarCommand, this.minigame_cost);
        });

        it('should push on_complete triggers', function() {
            this.command.execute({energy: 9, time: 10030});
           this.executor.should.have.been.calledWith(PushTriggersCommand, on_complete);
        })

        it('should switch state to next_state state', function() {
            this.command.execute({energy: 9, time: 10030});
            this.executor.should.have.been.calledWith(SetForensicItemStateCommand, {"forensic_item": "forensic_item_1", "state": "state_2"});
        });
    });
});

