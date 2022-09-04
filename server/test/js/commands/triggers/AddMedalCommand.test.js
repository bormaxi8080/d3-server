var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddMedalCommand', function() {
    subject('command', function() {
        return new AddMedalCommand();
    });

    var time = Date.now();

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_01"
            },
            "options": {
                "last_command_time": time,
                "init_time": time - 1000000
            },
            "open_cases": {
                "case_01": {
                    "stars" : 4,
                    "status": "primary_complete",
                    "medals": ["bronze"],
                    "opened_scenes": {
                        "scene_1": {
                            "stars": 3
                        }
                    }
                }
            },
            "case_statistics" : {
                "case_01" : {"start_time" : 1000}
            }
        });
    });

    describe("#execute", function() {
        it('should throw error if medal of this type already given', function() {
            var self = this;
            (function() {
                self.command.execute("bronze");
            }).should.throw(LogicError);
        });

        it('should add medal', function() {
            this.command.execute("gold");
            context.case.medals().should.deep.equal(["bronze", "gold"]);
        });

        it('should notify about added medal', function() {
            this.notifyEvent = helper.sandbox.stub(context.events, "notify");
            this.command.execute("gold");
            this.notifyEvent.should.have.been.calledWith("medal_received", "gold");
        });

        it('should track events success', function() {
            this.trackEvent = helper.sandbox.stub(context.track, "event");
            helper.sandbox.stub(context.case, "timeFromOpening", function() { return 10; });
            this.command.execute("silver");
            this.trackEvent.should.have.been.calledWith("case_walkthrough_time", null, null, "case_01", 10);
            this.trackEvent.should.have.been.calledWith("case_end_stars", null, "case_01", "scene_1", 3);
        });
    });
});

