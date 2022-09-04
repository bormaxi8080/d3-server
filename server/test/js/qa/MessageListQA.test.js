var helper = require('./../helper');
eval(helper.initContextCode());

describe('MessageListQA', function() {
    subject('QA', function() {
        return MessageListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            this.services = {
                "send_gift": {
                    "1": {
                        "operation_id": 1,
                        "result": {
                            "partner_id": "c4ec2befa05df5e17f4c84aa078f20df",
                            "type": "hog_usage",
                            "count": 5,
                            "content": {energy: 10},
                            "expires_date": 1386831580989
                        },
                        "error": false
                    }
                },
                "unlock_request": {
                    "22": {
                        "operation_id": 22,
                        "result": {
                            "partner_id": "c1b53fe519a7c3a8a66c50c1accb40f6",
                            "case_id": "case_01",
                            "request": true,
                            "expires_date": 1386831580990
                        },
                        "error": false
                    }
                }
            }
        });

        it('should return list of messages', function() {
            this.QA.handle(this.services).should.deep.equal([ {
                service_id: "send_gift",
                operation_id: 1,
                partner_id: 'c4ec2befa05df5e17f4c84aa078f20df',
                button_color: 'blue',
                button_title: 'interface.messages.send_gift.button_title',
                img: 'images/energy_big',
                count_text: '+5',
                text: 'interface.messages.send_gift.hog_usage.text'
            }, {
                service_id: 'unlock_request',
                operation_id: 22,
                partner_id: 'c1b53fe519a7c3a8a66c50c1accb40f6',
                button_color: 'blue',
                button_title: 'interface.messages.unlock_request.on_request.button_title',
                img: 'images/icon_request',
                count_text: '',
                text: 'interface.messages.unlock_request.on_request.text'
            }]);
        });
    });
});

