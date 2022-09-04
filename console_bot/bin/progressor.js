#!/usr/bin/env node

var _ = require('underscore');
var program = require('commander');
var utils = require('../lib/utils');
var Fiber  = require('fibers');
var Server = require('../lib/server');
var Player = require('../lib/player');
var PlayerHelper = require('../lib/player_helper');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-s, --server [local]', 'Select server', 'local')
    .option('-n, --network [GC]', 'Player initial network', 'GC')
    .option('-i, --social_id [id]', 'Player social_id')
    .option('-p, --player_id [id]', 'Player by predefined id from profile')
    .option('-v, --verbose', 'Display verbose player commands and events log')
    .option('--name [name]', 'Vertica event name to match')
    .option('--st1 [st1]', 'Vertica event st1 field to match')
    .option('--st2 [st2]', 'Vertica event st2 field to match')
    .option('--st3 [st3]', 'Vertica event st3 field to match')
    .parse(process.argv);


var EventFilter = function(option) {
    var values = ["name", "st1", "st2", "st3"].filter(function(key) {
        return !!option[key];
    });

    if (values.length) {
        var opts = {}
        values.forEach(function(name) {
            opts[name] = option[name];
        });

        this.match = function(change) {
            if (!this.is_vertica_event(change)) {
                return false;
            }
            var candidate = change.newValue.event;
            return _.every(opts, function(value, key) {
                return value == candidate[key]
            });
        };
        this.is_vertica_event = function(change) {
            return change.type == "event" &&
                change.newValue &&
                change.newValue.event;
        };
    } else {
        this.match = function() { return false }
    }
};

Fiber(function() {
    var server = Server.by_id(program.server);

    var player = null;
    if (program.player_id) {
        player = Player.by_id(server, program.player_id);
    } else {
        player = new Player(server, {
            network: program.network,
            social_id: program.social_id
        });
    }
    player.verbose = program.verbose;

    var filter = new EventFilter(program);
    var helper = new PlayerHelper(player);
    helper.player.set_change_handler(function(change) {
        if (filter.match(change)) {
            helper.running = false;
        }
    });
    helper.run();
}).run();
