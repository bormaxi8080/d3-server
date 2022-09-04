var helper = require('./../../helper');
var MigrateManager = helper.require("core/data/MigrateManager");
var fs = require('fs');

describe('MigrateManager', function() {
    subject('manager', function() {
        return new MigrateManager({directory:"", batchRunnerFactory: {}}, {});
    });

    beforeEach(function() {});

    describe('#createMigrations', function() {
        beforeEach(function() {
            helper.sandbox.stub(this.manager, 'createMigration', function(path) {
                return {};
            });
        });

        it('should return list of migrations', function() {
            files = ["file1.js", "file2.js", "file3.js"];
            this.manager.createMigrations(files).should.deep.equals([{}, {}, {}]);
        });

    });

    describe('#getMigrationsFiles', function() {
        describe('when directory not exists', function() {
            it('should throw error', function() {
                helper.sandbox.stub(fs, 'existsSync', function(param) {
                    return false;
                });
                var self = this;
                (function() {
                    self.manager.getMigrationsFiles("explicit-dir-name");
                }).should.throw(Error);
            });
        });

        describe('when directory exists', function() {
            beforeEach(function() {
                helper.sandbox.stub(fs, 'existsSync', function(param) {
                    return true;
                });
                helper.sandbox.stub(fs, 'readdirSync', function(param) {
                    var stubbedDirList = ["filename-1.js", "filename-2.js", "filename-3.js"];
                    return stubbedDirList;
                });
            });
            it('should accept only js files', function() {
                var stubbedDirList = [".", "./scripts", "filename-1.js", "filename-2.js", "filename-3.js"];
                this.manager.getMigrationsFiles("also-explicit-name").length.should.equals(3);
            });

            it('should return list of files', function() {
                var stubbedDirList = ["filename-1.js", "filename-2.js", "filename-3.js"];
                this.manager.getMigrationsFiles("also-explicit-name").should.deep.equals(stubbedDirList);
            });
        });
    })
});
