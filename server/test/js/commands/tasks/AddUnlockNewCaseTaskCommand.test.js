var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddUnlockNewCaseTaskCommand', function() {
    subject('command', function() {
        return new AddUnlockNewCaseTaskCommand();
    });

    beforeEach(function() {
        helper.sandbox.stub(definitions, "cases", {
            "case_01": {},
            "case_02": {}
        });
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.sandbox.stub(definitions.tasks, "unlock_new_case", {
            "default_cost": 3,
            "default_img": "images/unlock_new_case_default.png"
        });
    });

    describe('#execute', function() {
        it('should add task with custom cost', function() {
            this.command.execute({case: "case_01", cost: 2});
            this.executor.should.have.been.calledWith(PushTaskCommand, {
                "type": "unlock_new_case",
                "object_id": "case_01",
                "cost": 2,
                "triggers": []
            });
        });

        it('should add task with default cost', function() {
            this.command.execute({case: "case_02", triggers: [{"trigger": "value"}]});
            this.executor.should.have.been.calledWith(PushTaskCommand, {
                "type": "unlock_new_case",
                "object_id": "case_02",
                "cost": 3,
                "triggers": [{"trigger": "value"}]
            });
        });

    });
});

