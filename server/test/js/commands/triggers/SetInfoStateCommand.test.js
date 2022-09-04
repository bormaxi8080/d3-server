var helper = require('./../../helper');
eval(helper.initContextCode());

describe('SetInfoStateCommand', function() {
    subject('command', function() {
        return new SetInfoStateCommand();
    });

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": {
                "case_01": {
                    "info": {
                        "killer": "state_1"
                    }
                }
            }
        });
        helper.sandbox.stub(definitions.cases, "case_01", {
            "info": {
                "killer": {
                    "state_1": {},
                    "state_2": {}
                }
            }
        });
    });

    describe('#execute', function() {
        it('should set correct type info to expected state', function() {
            this.command.execute({type:"killer", state:"state_2"});
            context.case.info().killer.should.be.equal("state_2");
        })
    });

    describe('#execute', function() {
        it('should throw on non-existing state', function() {
            var self = this;
            (function() {
                self.command.execute({type:"killer", state:"state_3"});
            }).should.throw(LogicError);
        })
    });
});

