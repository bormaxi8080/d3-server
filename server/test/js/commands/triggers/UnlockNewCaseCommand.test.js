var helper = require('./../../helper');
eval(helper.initContextCode());

describe('UnlockNewCaseCommand', function() {
    subject('command', function() {
        return new UnlockNewCaseCommand();
    });

    var time = Date.now();

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {
                "triggers": {},
                "active_case" : "case_04"
            },
            "unlocked_cases": ["case_04"],
            "options": {
                "last_command_time": time
            },
            "new_cases": {
                "case_02": {}
            },
            "open_cases": {
                "case_03": {}
            }
        });
        helper.sandbox.stub(definitions, "cases", {
            "case_01": {},
            "case_02": {},
            "case_03": {},
            "case_04": {}
        });
    });

    describe('#execute', function() {
        it('should add case to new case list', function() {
            this.command.execute("case_01");
            context.storage.get_property("new_cases").should.have.property("case_01");
        });

        it('should throw on already added new case_id', function() {
            var self = this;
            (function () {
                self.command.execute("case_02");
            }).should.throw(LogicError);
        });

        it('should throw on already opened case_id', function() {
            var self = this;
            (function () {
                self.command.execute("case_03");
            }).should.throw(LogicError);
        });

        it('should throw on already unlocked case_id', function() {
            var self = this;
            (function () {
                self.command.execute("case_04");
            }).should.throw(LogicError);
        });
    });
});
