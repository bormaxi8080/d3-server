var helper = require('./../../helper');
eval(helper.initContextCode());

describe('ShowDeductionCommand', function() {
    subject('command', function() {
        return new ShowDeductionCommand();
    });

    var deduction = {obj: "key"};

    beforeEach(function() {
        helper.setContextWorld(context, {
            "immediate_data": {
                "active_case": "case_02"
            }
        });
        helper.sandbox.stub(definitions.cases.case_02, "deductions", {
            "deduction_1": deduction
        });
    });

    describe('#execute', function() {
        it('should generate corresponding event', function () {
            this.showDeduction = helper.sandbox.stub(context.events, "showDeduction");
            this.command.execute("deduction_1");
            this.showDeduction.should.be.calledWith("deduction_1", deduction);
        });

        describe('when deduction does not exists', function() {
            it('should throw', function() {
                var self = this;
                (function() {
                    self.command.execute("deduction_lol");
                }).should.throw(LogicError);
            });
        });
    });
});

