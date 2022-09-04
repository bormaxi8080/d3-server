var helper = require('./../../helper');
eval(helper.initContextCode());

describe('SendGiftCommand', function() {
    subject('command', function() {
        return new SendGiftCommand();
    });

    beforeEach(function() {
        this.executor = helper.sandbox.stub(Executor, "run");
        helper.sandbox.stub(definitions.interface, "messages", {
            "send_gift": {
                "gift_type": {}
            }
        });
        helper.setContextWorld(context, {
            "player": {"social_id" : "id"}
        });
    });

    var time = Date.now();

    it('should create service: send_gift', function() {
        this.createService = helper.sandbox.stub(context.env, "createService");
        this.command.execute("pid", time, "gift_type", 1, {energy: 10});
        this.createService.should.have.been.calledWith("send_gift", {
            target_id: "pid",
            partner_id: context.storage.get_property("player.social_id"),
            type: "gift_type",
            count: 1,
            content: {energy: 10},
            expires_date: context.get_service_expire_interval() + time
        });
    });
});