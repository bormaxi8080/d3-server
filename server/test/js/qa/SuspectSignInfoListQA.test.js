var helper = require('./../helper');
eval(helper.initContextCode());

describe('SuspectSignInfoListQA', function() {
    subject('QA', function() {
        return SuspectSignInfoListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                },
                "open_cases": {
                    "case_01": {
                        "known_suspects": {
                            "john": {
                                "clues": ["drunk"]
                            }
                        }
                    }
                }
            });

            helper.sandbox.stub(definitions.cases, "case_01", {
                "suspects": {
                    "john": {
                        "clues": {
                            "drunk": {
                                "img": "images/drunk.png",
                                "match": false
                            },
                            "dead": {
                                "img": "images/dead.png"
                            }
                        }
                    }
                }
            });
        });

        it('should return sign_info_list object', function() {
            this.QA.handle("john").should.deep.equal([{
                link: 'drunk',
                visible: true,
                match: false,
                hidden: false,
                picPath: 'images/drunk.png'
            }]);
        });
    });
});
