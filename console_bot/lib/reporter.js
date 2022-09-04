var util = require('util');
var u = require('./utils');
var _ = require('underscore');
var Table = require('cli-table');

var Reporter = function(concurrency) {
    this.players = [];
    this.tasks = [];
    this.finished_tasks = [];
    this.concurrency = concurrency;

    this.add_player = function(player) {
        if (this.concurrency)
            this.players.push(player);
    };

    // each task is player game loop
    this.set_tasks = function(tasks) {
        if (this.concurrency)
            this.tasks = tasks;
    };

    this.task_finished = function(task, id) {
        if (!this.concurrency)
            return;

        this.finished_tasks.push(task);
        if (this.finished_tasks.length == this.tasks.length) {
            console.log('all tasks finished');
            this.print_results();
        }
    };

    this.get_average_time = function(item_array) {
        return _.reduce(item_array, function(memo, value) {
            return memo + value.time_spent;
        }, 0) / item_array.length;
    };

    // merges every player items log into common array
    this.get_common_items = function(type) {
        var common_items = {};
        _.each(this.players, function(player) {
            _.each(player.log[type], function(items, name) {
                common_items[name] = (common_items[name] || []).concat(items)
            });
        });
        return common_items;
    };

    this.get_stats_for = function(type) {
        var self = this;
        var items = this.get_common_items(type);
        return _.map(items, function(item_array, item_name) {
            var avg = Math.floor(self.get_average_time(item_array) * 10) / 10;
            var max_item = _.max(item_array, function(item) { return item.time_spent });
            var min_item = _.min(item_array, function(item) { return item.time_spent });
            return [item_name, avg + 'ms', min_item.time_spent + 'ms', max_item.time_spent + 'ms', item_array.length + ' calls'];
        });
    };

    this.print_table_for = function(table_name, type) {
        var stats = this.get_stats_for(type);
        var table = new Table({
            head: [table_name, 'avg time', 'min time', 'max time', 'calls']
        });
        this.fill_table(table, stats);
        console.log(table.toString());
    };

    this.get_item_array = function(type) {
        var common_items = this.get_common_items('gameplay');
        return common_items[type] || [];
    };

    this.calc_cash_spent = function() {
        var item_array = this.get_item_array('cash_spent');
        return _.reduce(item_array, function(memo, item) {
            return memo + item.real_balance;
        }, 0);
    };

    this.calc_analyze_time = function() {
        var item_array = this.get_item_array('click_lab_item');
        return _.reduce(item_array, function(memo, item) {
            return memo + item.analyze_time;
        }, 0);
    };

    this.calc_energy_time = function() {
        var item_array = this.get_item_array('use_item');
        return _.reduce(item_array, function(memo, item) {
            return memo + item.energy;
        }, 0) * 3 * 60;
    };

    this.format_time_string = function(time) {
        return util.format('%d:%d:%d', ~~(time / 3600), (time % 3600) / 60, time % 60);
    };

    this.fill_table = function(table, data) {
        _.each(data, function(row) {
            table.push(row);
        });
    };

    this.print_gameplay_stats = function() {
        var analyze_time = this.calc_analyze_time();
        var energy_time = this.calc_energy_time();
        var player = this.players[0].context.player;
        var p = function() {console.log.apply(console, arguments)};

        p('GAMEPLAY STATISTICS');
        p('Endgame state:')
        p('  Level:        %d', player.get_level());
        p('  Exp:          %d', player.get_xp());
        p('  Game balance: %d', player.get_game_balance());
        p('  Real balance: %d', player.get_real_balance());
        p('')
        p('Walkthrough:')
        p('  Real spent:   %d', this.calc_cash_spent());
        p('  Time saved by analyze speed up: %s', this.format_time_string(analyze_time));
        p('  Time saved by energy packs:     %s', this.format_time_string(energy_time));
        p('  ESTIMATED GAMEPLAY TIME:        %s', this.format_time_string(analyze_time + energy_time));
    };

    this.print_requests_stats = function() {

        function time_spreading(ms_array) {
            var spreading = {};
            var ms_sorted = ms_array.sort(function(a, b) {
                return a - b;
            });

            function slice_time(part) {
                var head = _.first(ms_sorted, Math.floor(part * ms_sorted.length));
                if (_.isEmpty(head)) {
                    return [0, 0];
                } else {
                    return [_.max(head), head.length];
                }
            }

            _.each([10, 25, 50, 75, 90, 95, 99], function(num) {
                var slice = slice_time(num / 100);
                spreading[num + '%'] = slice[0] + ' ms, ' + slice[1] + ' reqs';
            });
            spreading['100%'] = _.max(ms_sorted) + ' ms (longest request)';
            return spreading;
        }

        // get all request types
        var requests = this.get_common_items('request');

        // total requests made
        var total_requests = _.reduce(requests, function(memo, req_array) {
            return memo += req_array.length;
        }, 0);

        // total time spent for all requests
        var total_time = 0;
        _.each(requests, function(req_array) {
            _.each(req_array, function(req) { total_time += req.time_spent; });
        });

        var total_avg_time = (total_time / total_requests).toFixed(2);
        var total_req_per_sec = (1000 / total_avg_time).toFixed(2);
        var total_req_per_sec_concurrent = (total_req_per_sec * this.concurrency).toFixed(2)
        var p = function() {console.log.apply(console, arguments)};

        p('Completed requests:        %d', total_requests);
        p('Requests per second:       %d (across all requests)', total_req_per_sec);
        p('Requests per second:       %d (across all requests, concurrently)', total_req_per_sec_concurrent);
        p('Total time taken:          %d s', (total_time / 1000).toFixed(2));
        p('Average request time:      %d ms (across all requests)', total_avg_time);
        p('Estimated online handle:   %d users (each making 1 apply_batch/minute. very pessimistic)', ((total_req_per_sec_concurrent) / 0.016).toFixed(2));

        p('Completed requests by type:');
        _.each(requests, function(req_array, name) {
            var req_total_time = 0;
            var ms_array = [];
            _.each(req_array, function(req) {
                ms_array.push(req.time_spent);
                req_total_time += req.time_spent;
            });
            var avg_time = (req_total_time / req_array.length).toFixed(2);
            var req_per_sec = (1000 / avg_time).toFixed(2);
            var min_req = _.min(req_array, function(req) { return req.time_spent; });
            var max_req = _.max(req_array, function(req) { return req.time_spent; });

            p('\n' + name);
            p('  Requests completed:      %d', req_array.length);
            p('  Requests per second:     %d', req_per_sec);
            p('  Average request time:    %d ms', avg_time);
            p('  Minimum request time:    %d ms', min_req.time_spent);
            p('  Maximum request time:    %d ms', max_req.time_spent);

            p('  Request spreading by time:');
            var spreading = time_spreading(ms_array);
            _.each(spreading, function(data, name) {
                p('    %s: %s', name, data);
            });
        });
    };

    this.print_results = function() {
        console.log('concurrency level: %d', this.concurrency);

        console.log('\nREQUEST STATISTICS\n');
        this.print_requests_stats();

        console.log('\nCOMMANDS STATISTICS');
        this.print_table_for('COMMANDS', 'command');

        if (this.concurrency == 1) {
            this.print_gameplay_stats();
        }
    };
};

module.exports = Reporter;
