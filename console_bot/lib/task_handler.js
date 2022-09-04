var _ = require('underscore');
var u = require('../lib/utils');

var TaskHandler = function(player_helper) {
    var self = this;
    var h = player_helper;
    var player = player_helper.player;
    var context = player_helper.context;

    var handlers = {
        examine: new function() {
            this.handle = function(task) {
                // energy must be greater than 0 and less than start_energy
                var start_energy = context.defs.get_def('energy_settings.minigame_start_energy');
                var energy = 1 + Math.round(Math.random() * (start_energy - 1));

                h.player.execute('start_minigame', { forensic_item: task.object_id });
                h.player.execute('end_minigame', { forensic_item: task.object_id, energy: energy });
            };
        },

        investigate: new function() {
            this.handle = function(task) {
                if (h.has_enough_energy_for(task)) {
                    h.player.execute("start_scene", { scene: task.object_id, boosters: [], hints: 1 });
                    h.player.execute("end_scene", { scene: task.object_id, scores: 0 });
                } else {
                    h.restore_energy();
                }
            };
        },

        analyze: new function() {
            this.handle = function(task) {
                var item_id = task.object_id;
                var lab_item = h.context.case.foundLabItems(item_id);
                h.log('lab_item analyze task %j ', lab_item);

                if (lab_item.state == 'new') {
                    h.log('lab_item start analyze', task);

                    h.player.execute('click_lab_item', { lab_item: item_id });
                } else if (lab_item.state == 'analyzing') {
                    h.log('lab_item analyzing. speeding up %j ', lab_item);

                    if (h.has_enough_cash_for(task)) {
                        h.player.log_item('gameplay', {
                            name: 'click_lab_item', lab_item: item_id,
                            analyze_time: h.context.case.analyzeTime(item_id)
                        });
                        h.log_cash_spent(h.get_task_price(task));

                        h.player.execute('click_lab_item', { lab_item: item_id });
                    } else {
                        h.buy_cash();
                    }
                } else if (lab_item.state == 'done') {
                    h.log('lab_item analyze already done %j ', lab_item);
                }
            };
        },

        talk: new function() {
            this.handle = function(task) {
                h.player.execute('click_suspect', { suspect: task.object_id });
            };
        },

        arrest: new function() {
            this.handle = function(task) {
                var suspects = context.case.knownSuspects();

                var arrestable = [];
                _.each(suspects, function(suspect, id) {
                    if (suspect.state == 'arrest')
                        arrestable.push(id);
                });

                if (arrestable.length) {
                    h.player.execute('click_suspect', { suspect: _.sample(arrestable) });
                } else {
                    h.log('no arrestable suspects found', u.inspect(suspects, true));
                }
            };
        },

        start_next_chapter: new function() {
            this.handle = function(task, index) {
                h.player.execute('click_task', { index: index });
            };
        },

        unlock_new_case: new function() {
            this.handle = function(task, index) {
                h.player.execute('click_task', { index: index });
            };
        },

        buy_booster: new function() {
            this.handle = function(task, index) {
                h.player.execute('click_task', { index: index });
            };
        },

        buy_item: new function() {
            this.handle = function(task, index) {
                h.player.execute('click_task', { index: index });
            };
        },

        earn_stars: new function() {
            this.handle = function(task) {
                h.play_for_stars(task);
            };
        },

        custom: new function() {
            this.handle = function(task, index) {
                h.player.execute('click_task', { index: index });
            };
        }
    };

    // public interface
    this.handle = function(task, index) {
        h.log('handle task %s. object_id %s, cost %j', task.type, task.object_id,
            context.tasks.displayedCost(task, h.player.time())
        );

        if (this.has_enough_stars_for(task)) {
            handlers[task.type].handle(task, index);
        } else if (h.context.case.starsLeftToGet()) {
            h.play_for_stars(task);
        } else {
            h.log('ERROR: no more stars in case');
            h.log('Commands log', u.inspect(h.player.log));
            process.exit(1);
        }
    };

    this.has_enough_stars_for = function(task) {
        var cost = context.tasks.displayedCost(task, player.time());
        var stars = context.case.stars();
        if (cost.star && stars < cost.star) {
            h.log('not enough stars for task %s. need %j. have %d',
                task.type, cost.star, stars
            );
            return false;
        } else {
            return true;
        }
    };
};

module.exports = TaskHandler;

