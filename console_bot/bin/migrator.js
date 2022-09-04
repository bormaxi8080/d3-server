#!/usr/bin/env node

var _ = require('underscore');
var program = require('commander');
var Fiber  = require('fibers');
var Server = require('../lib/server');

var verbose = function() {
    if (program.verbose) {
        console.log.apply(console, arguments);
    }
};

program
    .usage('[command] [options]')
    .option('-s, --server [local]', 'Select server', 'local')
    .option('-g, --target_server [local]', 'Target server for testing migrations', 'local')
    .option('-v, --verbose', 'Display verbose player commands and events log')
    .option('-f, --level_from [0]', 'Lower level boundary', 0)
    .option('-t, --level_to [99]', 'Upper level boundary', 99)
    .option('-s, --start_migration [0]', 'Users states starting from migration', 0)
    .option('-e, --end_migration [99999999999999]', 'Users states up to migration', 99999999999999)
    .option('-c, --count [1]', 'Limit users count', 1)

program
    .command('list')
    .description('lists all user from real server that match parameters')
    .action(function(env) {
        var server = Server.by_id(program.server, { logic: false });
        var res = server.available_users({
            level_from: program.level_from,
            level_to: program.level_to,
            migration_from: program.start_migration,
            migration_to: program.end_migration,
            count: program.count
        });
        console.log('AVAILABLE USERS:', res);
    });

program
    .command('test')
    .description('tests selected users against target server')
    .action(function(env) {
        var server = Server.by_id(program.server, { logic: false });
        var res = server.available_users({
            level_from: program.level_from,
            level_to: program.level_to,
            migration_from: program.start_migration,
            migration_to: program.end_migration,
            count: program.count
        });

        if (res.status !== 'ok') {
            return console.log('Failed to load users: ', res.msg);
        } else if (!res.users.length) {
            return console.log('No users found');
        }

        verbose('Users found: ', res.users.length);
        verbose(res.users);

        var dump_res = server.download_dump({ users: res.users });
        if (dump_res.status !== 'ok') {
            return console.log('Failed to load user dumps: ', dump_res.msg);
        }

        verbose('User dumps loaded: ', dump_res.users.length);
        verbose(dump_res.users);

        var target_server = Server.by_id(program.target_server, { logic: false });

        var migrate_res = target_server.migrate({ users: dump_res.users });
        if (migrate_res.status !== 'ok') {
            console.log('Failed to perform migratios: ', migrate_res.msg);
        }

        verbose('Migrations completed: ', migrate_res.logs.length);
        verbose(migrate_res.logs)

        var problem_logs = migrate_res.logs.filter(function(log) {
            return log.status !== 'ok';
        });

        if (problem_logs.length) {
            console.log("Migration test failed:");
            console.log(problem_logs);
        } else {
            console.log("Migrations tested succesfully, no problems found.");
        }
    });

Fiber(function() {
    program.parse(process.argv);
}).run();
