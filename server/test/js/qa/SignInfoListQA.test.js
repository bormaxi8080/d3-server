var helper = require('./../helper');
eval(helper.initContextCode());

describe('SignInfoListQA', function() {
    subject('QA', function() {
        return SignInfoListQA;
    });

    describe('#handle', function() {
        beforeEach(function() {
            helper.setContextWorld(context, {
                "immediate_data": {
                    "active_case": "case_01"
                },
                "open_cases": {
                    "case_01": {
                        "known_clues": ["man185"]
                    }
                }
            });
            helper.sandbox.stub(definitions.cases, "case_01", {
                "clues": {
                    "man185": {
                        "img": "images/man_1-85.png"
                    },
                    "tolstovka": {
                        "img": "images/tolstovka.png"
                    }
                }
            });
            helper.sandbox.stub(definitions, "interface", {
                "img": {
                    "alibi": {
                        "true": "images/alibi.png",
                        "false": "images/alibi_no.png"
                    },
                    "motive": {
                        "true": "images/motiv.png",
                        "false": ""
                    }
                }
            });
        });

        it('should return sign_info_list object', function() {
            this.QA.handle().should.deep.equal([{
                name: 'man185',
                visible: true,
                hidden: false,
                picPath: 'images/man_1-85.png'
            }]);
        });
    });
});
