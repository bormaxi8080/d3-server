#!/usr/bin/env node

var _ = require('underscore');
var program = require('commander');
var utils = require('../lib/utils');
var Fiber  = require('fibers');
var Server = require('../lib/server');
var Player = require('../lib/player');
var Scenario = require('../lib/scenario');
var Reporter = require('../lib/reporter');

program
    .version('0.0.1')
    .usage('[options] <scenarios ...>')
    .option('-s, --server [local]', 'Select server', 'local')
    .option('-n, --network [GC]', 'Player initial network', 'GC')
    .option('-i, --social_id [id]', 'Player social_id')
    .option('-p, --player_id [id]', 'Player by predefined id from profile')
    .option('-r, --partners <players..>', 'Comma-separated list of partners', utils.list)
    .option('-v, --verbose', 'Display verbose player commands and events log')
    .option('-c, --concurrency [number]', 'Number of tasks running in parallel')
    .parse(process.argv);

Fiber(function() {
    var server = Server.by_id(program.server);

    var concurrency = 1;
    if (program.concurrency) {
        concurrency = program.concurrency;
    }
    var reporter = new Reporter(program.concurrency);

    var execution_flow = function(reporter, id) {
        var player = null;
        if (program.player_id) {
            player = Player.by_id(server, program.player_id);
        } else {
            player = new Player(server, {
                network: program.network,
                social_id: program.social_id
            });
        }

        if (program.verbose) {
            player.verbose = program.verbose;
        }
        reporter.add_player(player);

        var scenarios = program.args.map(function(scenario_id) {
            return Scenario.by_id(scenario_id);
        });

        var partners = (program.partners || []).map(function(partner_id) {
            return Player.by_id(server, partner_id);
        });

        _.each(scenarios, function(scenario) {
            scenario.execute(player, partners);
        });

        reporter.task_finished(this, id);
    };

    var tasks = _.range(0, concurrency).map(function(id) {
        return Fiber(function() {
            execution_flow(reporter, id);
        });
    });
    reporter.set_tasks(tasks);
    _.each(tasks, function(task) { task.run(); });
}).run();
