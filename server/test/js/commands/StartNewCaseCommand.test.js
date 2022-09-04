var helper = require('./../helper');
eval(helper.initContextCode());

var world = {
    "immediate_data": {
        "active_case": "",
        "triggers": {}
    },
    "unlocked_cases": ["case_01"],
    "open_cases": {}
}

var triggers = [{"trigger": "value"}];

describe('StartNewCaseCommand', function() {
    beforeEach(function() {
        helper.sandbox.stub(definitions.cases, "case_01", {
            "on_start": triggers
        });
        helper.setContextWorld(context, {
            "immediate_data": {
                "triggers": {}
            },
            "unlocked_cases": ["case_01"],
            "open_cases": {}
        });
        this.executor = helper.sandbox.stub(Executor, "run");
    });

    subject('command', function() {
        return new StartNewCaseCommand();
    });

    describe('#execute', function() {
        var expected_case = {
            "status": "open",
            "medals": [],
            "stars": 0,
            "opened_scenes": {},
            "found_lab_items": {},
            "found_forensic_items": {},
            "known_clues": [],
            "known_suspects": {},
            "performed_transitions": [],
            "performed_custom_tasks": [],
            "tasks": [],
            "chapter": {
                "index": 0,
                "progress": 0,
                "completed": false
            },
            "info": {
                "victim": "default",
                "weapon": "default",
                "killer": "default"
            },
            "mistaken_arrests": 0
        }

        it('should init data case', function() {
            this.command.execute("case_01");
            context.storage.get_property("open_cases.case_01").should.be.deep.equal(expected_case);
        });

        it('should invoke PushTriggers command', function() {
            this.command.execute("case_01");
            this.executor.should.be.calledWith(PushTriggersCommand, triggers);
        });

        it('should set active case', function() {
            this.command.execute("case_01");
            context.case.activeCase().should.be.equal("case_01");
        });
    });
});
