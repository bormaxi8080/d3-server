var helper = require('./../../helper');
eval(helper.initContextCode());

describe('AddStartNextChapterTaskCommand', function() {
    subject('command', function() {
        return new AddStartNextChapterTaskCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.setContextWorld(context, {
            "immediate_data": {"active_case": "case_01"},
            "open_cases": { "case_01": {"chapter": {"index": 1 } } }
        });
        helper.sandbox.stub(definitions.tasks, "start_next_chapter", {
            "default_cost": 3,
            "default_img": "images/start_next_chapter_default.png"
        });
    });

    describe('#execute', function() {
        it('should add task with custom cost', function() {
            this.command.execute({cost: 2});
            this.executor.should.have.been.calledWith(PushTaskCommand, {
                "type": "start_next_chapter",
                "object_id": 2,
                "cost": 2
            });
        });

        it('should add task with default cost', function() {
            this.command.execute({});
            this.executor.should.have.been.calledWith(PushTaskCommand, {
                "type": "start_next_chapter",
                "object_id": 2,
                "cost": 3
            });
        });

    });
});

