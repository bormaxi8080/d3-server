var Mixer = require("../../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var Fiber = require('fibers');
var path = require('path');
var pg = require('pg');
var Config = require('../../core/Config');
var _ = require('underscore');
var util = require('util');
var url = require('url');

function count_stars(data) {
    var total_stars = 0;
    if (data.open_cases) {
        for (var case_id in data.open_cases) {
            var current_case = data.open_cases[case_id];
            if (current_case.opened_scenes) {
                for (var scene_id in current_case.opened_scenes) {
                    var scene = current_case.opened_scenes[scene_id];
                    total_stars += parseInt(scene.stars);
                }
            }
        }
    }
    return total_stars;
}

function create_filled_array(length, val) {
    var array = new Array(length);
    var i = 0;
    while (i < length) {
        array[i++] = val;
    }
    return array;
}

var total_steps = 13 + 32 + 58 + 42 + 49;
var chapters = {
    case_01: { indexes: [0, 7], length: 13 },
    case_02: { indexes: [0, 12, 19, 26], length: 32 },
    case_03: { indexes: [0, 15, 33, 45], length: 58 },
    case_04: { indexes: [0, 9, 24, 37], length: 42 },
    case_05: { indexes: [0, 11, 23, 32], length: 49 }
};

var UsersStatsHandler = function(core, next) {
    this.core = core;
    this.next = next;
    this.logger = core.logger;
    this.init();
};

UsersStatsHandler.prototype.init = function() {
    var config_path = path.join(__dirname, '../../../config');

    this.db_config = Config.db_config(config_path);
    this.db_common = this.db_config.db.common;

    var progress = {};
    for (var case_id in chapters) {
        progress[case_id] = create_filled_array(chapters[case_id].length, 0);
    };
    this.progress = progress;
};

UsersStatsHandler.prototype.store_progress = function(data) {
    if (data.open_cases) {
        var cases = ['case_01', 'case_02', 'case_03', 'case_04', 'case_05'];
        for (var index in cases) {
            var case_id = cases[index];
            if (!data.open_cases[case_id]) {
                break;
            }

            var steps = this.progress[case_id];
            var helper = chapters[case_id];
            var chapter = data.open_cases[case_id].chapter;
            var user_step = helper.indexes[chapter.index] + chapter.progress;

            for (var step in steps) {
                if (user_step >= step) {
                    steps[step]++;
                }
            }
        }
    }
};

function fix_timestamp(ts) {
    if (parseInt(ts[1]) < 1970)
        ts[1] = '1970';
    if (parseInt(ts[2]) < 1)
        ts[2] = '01';
    if (parseInt(ts[3]) < 1)
        ts[3] = '01';
}

function parse_date(date_str, default_date, format) {
    var arr = new Array;
    if (date_str)
        arr = date_str.match(/(\d{4})-(\d{2})-(\d{2})/);

    if (arr.length) {
        fix_timestamp(arr);
        return util.format(format, arr[1], arr[2], arr[3]);
    }
    return default_date;
}

UsersStatsHandler.prototype.handle = function(task, callback) {
    var self = this;

    var db_config = this.db_config;
    var db_common = this.db_common;
    var levels = [];
    var payments = [];
    var stars = {};
    var get = url.parse(task.request.url, true).query;
    var from_date = parse_date(get.from, '1970-01-01 00:00:00', '%s-%s-%s 00:00:00');
    var to_date = parse_date(get.to, '9999-12-31 23:59:59', '%s-%s-%s 23:59:59');

    // for each shard
    Fiber(function() {
        var fiber = Fiber.current;

        for (shard_id in db_config.shards) {
            var db_name = db_config.shards[shard_id].db;
            var db_uri = 'postgres://' + db_common.username + ':' + db_common.password + '@' + db_common.params.host + '/' + db_name;

            pg.connect(db_uri, function(err, client) {
                if (err) return console.error('Cannot connect to %s', db_name);

                var q = [
                    'SELECT data',
                    'FROM users',
                    'INNER JOIN world_data ON (world_data.id = users.id)',
                    'WHERE (users."createdAt" >= \'' + from_date + '\')',
                    '  AND (users."createdAt" <= \'' + to_date + '\')'
                ].join('\n');

                client.query(q, function(err, res) {
                    if (err) return console.error('Query error', err);
                }).on('row', function(user) {
                    var data = JSON.parse(user.data);

                    var user_stars = count_stars(data);
                    if (!stars[user_stars])
                        stars[user_stars] = 0;
                    stars[user_stars]++;

                    self.store_progress(data);
                }).on('end', function() {
                    var q = [
                        'SELECT product_code, COUNT(product_code) as count',
                        'FROM payments',
                        'WHERE (payments."createdAt" >= \'' + from_date + '\')',
                        '  AND (payments."createdAt" <= \'' + to_date + '\')',
                        'GROUP BY product_code ORDER BY product_code ASC'
                    ].join('\n');

                    client.query(q, function(err, res) {
                        if (err) return console.error('Query error', err);
                    }).on('row', function(row) {
                        payments[payments.length] = {
                            product_code: row.product_code,
                            count: row.count
                        };
                    }).on('end', function() {
                        var q = [
                            'SELECt level, COUNT(level) as count',
                            'FROM users',
                            'WHERE (users."createdAt" >= \'' + from_date + '\')',
                            '  AND (users."createdAt" <= \'' + to_date + '\')',
                            'GROUP BY level',
                            'ORDER BY level asc'
                        ].join('\n');

                        client.query(q, function(err, res) {
                            if (err) return console.error('Query error', err);
                        }).on('row', function(row) {
                            levels[levels.length] = {
                                level: row.level,
                                count: row.count
                            };
                        }).on('end', function() {
                            fiber.run();
                        });
                    });
                });
            });

            Fiber.yield();
        }

        var report_body = '"User stats"\n';

        report_body += '\nStars\n';
        report_body += 'Quantity;Players\n';
        _.each(stars, function(value, key) {
            report_body += util.format('%d;%d\n', key, value);
        });

        var payments_uniq = payments.reduce(function(memo, value) {
            memo[value.product_code] = memo[value.product_code] || 0;
            memo[value.product_code] += value.count;
            return memo;
        }, {});

        report_body += '\nPayments\n';
        report_body += '"Product Code";"Purchased(times)"\n';
        _.sortBy(Object.keys(payments_uniq), function(value) { return parseInt(value) }).forEach(function(product_code) {
            report_body += util.format('%s;%d\n', product_code, payments_uniq[product_code]);
        });

        report_body += '\n"Game Progress"\n';
        var progress_keys = Object.keys(self.progress).sort();
        progress_keys.forEach(function(case_id) {
            report_body += '"Case ' + case_id + '"\n';

            report_body += 'Step;Players\n';
            var pcase = self.progress[case_id];
            _.each(pcase, function(count, step) {
                report_body += util.format('%d;%d\n', step, count);
            });
        });

        var levels_uniq = levels.reduce(function(memo, value) {
            memo[value.level] = memo[value.level] || 0;
            memo[value.level] += value.count;
            return memo;
        }, {});

        report_body += '\nLevels\n';
        _.sortBy(Object.keys(levels_uniq), function(value) { return parseInt(value) }).forEach(function(level) {
            report_body += util.format('%d;%d\n', level, levels_uniq[level]);
        });

        sendResult(200, report_body);
    }).run();

    var sendResult = function(code, body) {
        task.response.setHeader('Content-disposition', 'attachment; filename=users_statistics.csv');
        task.response.writeHead(code, {
            'Content-Type': 'text/csv'
        });
        task.response.end(body);
        self.emit('complete', null);
    };
};

Mixer.mix(UsersStatsHandler.prototype, EventEmitter.prototype);

module.exports = UsersStatsHandler;
