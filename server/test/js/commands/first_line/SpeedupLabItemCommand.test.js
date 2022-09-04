var helper = require('./../../helper');
eval(helper.initContextCode());

describe('SpeedupLabItemCommand', function() {
    subject('command', function() {
        return new SpeedupLabItemCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "player": {
                "real_balance": 2
            },
            "immediate_data": {
                "active_case": "case_01",
                "analyzed_items": {
                    "case_01": {
                        "body": {
                            "end": 300000
                        }
                    }
                }
            },
            "open_cases": {
                "case_01": {
                    "found_lab_items": {
                        "body": {
                            "state": "analyzing"
                        },
                        "item_2": {
                            "state": "done"
                        }
                    }
                }
            }
        });

        helper.sandbox.stub(definitions.cases.case_01, "lab_items", {
            "body": {},
            "item_2": {}
        });

        helper.sandbox.stub(definitions, "cash_settings", {
            "analyze_speedup_base_cash_per_hour": 12
        });

        this.reduce_real_balance = helper.sandbox.stub(context.player, "reduce_real_balance");
    });

    describe('#execute', function() {
        var now = 100000;
        it('should consume proper amoun of cash', function() {
            this.command.execute({"lab_item": "body", "time": now});
            this.reduce_real_balance.should.have.been.calledWith(1);
        });

        it('should set end_time to new value', function() {
            this.command.execute({"lab_item": "body", "time": now});
            context.case.analyzedItems("body").end.should.equal(now);
        });

        it('should throw on non-analyzing items', function() {
            var self = this;
            (function() {
                seld.command.execute({"lab_item": "item_2", "time": now});
            }).should.not.throw(LogicError);
        });

        it('should track proper event', function() {
            this.trackEvent = helper.sandbox.stub(context.track, "event");
            this.command.execute({"lab_item": "body", "time": now});
            this.trackEvent.should.have.been.calledWith("lab_item_speedup", "case_01", null, "body", 200);
        });
    });
});

