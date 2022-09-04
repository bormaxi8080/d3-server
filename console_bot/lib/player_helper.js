var u = require('./utils');
var TaskHandler = require('../lib/task_handler');
var _ = require('underscore');

var PlayerHelper = function(player) {
    this.player = player;

    this.run = function() {
        // init player
        this.player.reset();
        this.player.init();
        this.context = this.player.context;
        this.storage = this.context.storage;
        this.task_handler = new TaskHandler(this);

        // game loop
        this.iteration = 0;
        this.case_finished = false;
        this.running = true;
        while (this.running) {
            this.log('GAME ITERATION %d', this.iteration);

            try {
                this.player.ensure_inited();

                if (this.has_active_case() && !this.case_finished) {
                    this.log('has active case');
                    this.process_case();
                } else {
                    this.log('no active case');
                    this.select_case();
                }
                this.iteration++;
                this.player.apply_batch();
            } catch (e) {
                if (e.ConnectionError) {
                    this.player.authorized = false;
                    this.player.inited = false;
                    console.log('Error %s, %s', e.url, e.message);
                } else {
                    console.log('Unknown Error %s', e);
                }
            }
        }
    };

    this.process_case = function() {
        var case_id = this.get_active_case();

        this.log('process case [%s]', case_id);

        if (this.has_triggers()) {
            this.log('applying case triggers');
            this.player.apply_triggers();
        } else {
            this.log('no triggers present');
        }

        if (this.has_tasks()) {
            this.log('got case tasks');

            var tasks = this.get_tasks();
            var index = Math.round(Math.random() * (tasks.length - 1));
            var task = tasks[index];
            if (task) {
                this.handle_task(task, index);
            } else {
                this.log('cant get random task', u.inspect(tasks, true));
            }
        } else {
            this.log('no more tasks. case finished.');
            var gamedata = this.get_gamedata();
            this.log('gamedata', u.inspect(gamedata, true));
            this.case_finished = true;
        }
    };

    this.select_case = function() {
        this.log('no active case');

        if (this.has_unlocked_cases()) {
            var unlocked_cases = this.get_unlocked_cases();
            this.log('has unlocked cases', u.inspect(unlocked_cases, true));
            this.open_case(unlocked_cases[0]);
            this.case_finished = false;
        }
        else if (this.has_new_cases()) {
            var new_cases = this.get_new_cases();
            this.log('has new cases', u.inspect(new_cases, true));
            this.unlock_new_case(Object.keys(new_cases)[0]);
        }
        else {
            this.log('no unlocked && no new cases');

            var gamedata = this.get_gamedata();
            this.log('gamedata', u.inspect(gamedata, true));

            this.running = false;
        }
    };

    this.get_gamedata = function() {
        return this.context.getStorageDump();
    };

    this.get_immediate_data = function() {
        return this.storage.get_property('immediate_data');
    };

    this.has_active_case = function() {
        if (this.storage.has_property('immediate_data.active_case')) {
            return true;
        }
        return false;
    };

    this.get_active_case = function() {
        return this.storage.get_property('immediate_data.active_case');
    };

    this.has_unlocked_cases = function() {
        if (this.storage.has_property('unlocked_cases')) {
            return this.storage.get_property('unlocked_cases').length;
        }
        return false;
    };

    this.get_unlocked_cases = function() {
        var cases = this.storage.get_property('unlocked_cases');
        this.log('has unlocked cases [%s]', cases.join(', '));
        return cases;
    };

    this.has_open_cases = function() {
        if (this.storage.has_property('open_cases')) {
            return Object.keys(this.storage.get_property('open_cases')).length;
        }
        return false;
    };

    this.get_open_cases = function() {
        var open_cases = this.storage.get_property('open_cases');
        this.log('has open cases', u.inspect(open_cases, true));
        return open_cases;
    };

    this.open_case = function(case_id) {
        this.log('opening case [%s]', case_id);
        this.player.execute("open_case", { case: case_id });
    };

    this.has_new_cases = function() {
        if (this.storage.has_property('new_cases')) {
            return Object.keys(this.storage.get_property('new_cases')).length;
        }
        return false;
    };

    this.has_tutorial = function() {
        return this.storage.has_property('tutorial.state');
    }

    this.try_drop_tutorial = function() {
        if (this.has_tutorial()) {
            this.log('dropping tutorial');
            this.player.execute("drop_tutorial", {});
        }
    }

    this.get_new_cases = function() {
        return this.storage.get_property('new_cases');
    };

    this.get_new_case = function() {
        var new_cases = this.storage.get_property('new_cases');
        this.log('new_case', u.inspect(new_cases[0], true));
        return new_cases[0];
    };

    this.unlock_new_case = function(case_id) {
        this.log('unlock new case [%s]', case_id);

        if (this.has_cash_for_unlock(case_id)) {
            this.player.execute('unlock_case', { case: case_id });
            this.try_drop_tutorial();
        } else {
            this.buy_cash();
        }
    };

    this.has_tasks = function() {
        return this.context.case.tasks().length > 0;
    };

    this.get_tasks = function(case_id) {
        var tasks = this.context.case.tasks(case_id);
        if (tasks.length) {
            this.log('case [%s] has tasks %s', case_id, u.inspect(tasks, true));
        } else {
            this.log('case [%s] has no tasks');
        }
        return tasks;
    };

    this.handle_task = function(task, index) {
        if (task.type == 'custom' && task.object_id == 'spectial_arrest') {
            this.log('medal bug', u.inspect(task, true));
        }
        this.task_handler.handle(task, index);
    };

    this.task_need_stars = function(task) {
        var cost = this.context.tasks.displayedCost(task, this.player.time());
        this.log('task cost', cost);
        return !!cost.star;
    };

    this.play_for_stars = function(task) {
        var cost = this.context.tasks.displayedCost(task, this.player.time());
        var stars = this.context.case.stars();
        if (!!cost.star) {
            this.log('not enough stars to complete task %s. need %j. have %d',
                task.type, cost.star, stars
            );
        }

        var scenes = this.context.case.openedScenes();
        this.log('scenes', u.inspect(scenes, true));

        for (var scene_id in scenes) {
            var stars = this.context.case.sceneStars(scene_id);
            if (stars < 5) {
                // check and restore energy
                var enougn_energy = false;
                var energy_cost = this.context.case.sceneEnergyCost(scene_id, this.context.case.activeCase);
                this.log('scene %s energy cost: %d', scene_id, energy_cost);
                while (this.context.energy.get() < energy_cost) {
                    this.log('current player energy %d', this.context.energy.get());
                    this.restore_energy();
                }

                // play scene
                var scene = this.context.case.openedScenes(scene_id);
                var max_score = this.context.hog.sceneMaxScore(scene_id);
                var scores = Math.round(Math.random() * max_score);

                this.log('scene %s. generated scores %d', u.inspect(scene, true), scores);

                this.player.execute('start_scene', { scene: scene_id, boosters: [], hints: 1 });
                this.player.execute('end_scene', { scene: scene_id, scores: scores });

                // apply triggers to bypass scene_already_opened bug
                this.player.apply_triggers();

                u.sleep(5);
            } else {
                this.log('skipping scene. has 5 stars.');
            }
        }
    };

    this.task_need_energy = function(task) {
        var cost = this.context.tasks.displayedCost(task, this.player.time());
        this.log('task cost', cost);
        return !!cost.energy;
    };

    this.has_enough_energy_for = function(task) {
        var cost = this.context.tasks.displayedCost(task, this.player.time());
        var energy = this.context.energy.get();
        if (energy >= cost.energy) {
            this.log('has enough energy for task %s. need %j. have %d',
                task.type, cost.energy, energy
            );
            return true;
        }
        return false;
    };

    this.restore_energy = function(task) {
        // get random pack type and by it
        var pack_types = this.context.defs.get_def('packs.pack_types');
        var pack_type_names = Object.keys(pack_types);
        var pack_type = _.sample(pack_type_names);

        // buy money if needed
        if (this.has_enough_cash_for_pack(pack_type)) {
            this.log('buying random pack_type', pack_type);

            this.log_cash_spent(this.get_pack_price(pack_type));

            // then buy energy pack
            this.player.execute('buy_pack', { pack_type: pack_type });
            this.player.apply_triggers();

            this.use_energy_pack();

            // this.inspect_gamedata(true);
        } else {
            this.buy_cash();
        }
    };

    this.inspect_gamedata = function(kill) {
        var gamedata = this.context.getStorageDump();
        this.log('gamedata', u.inspect(gamedata, true));
        if (kill != null)
            process.kill(0);
    };

    this.use_energy_pack = function(pack_type) {
        var inventory = this.get_inventory_items();
        var items = Object.keys(inventory);

        // use random item
        var item_type = _.sample(items);
        var item_def = this.context.defs.get_def('items.item_types.' + item_type);

        // log gameplay event
        this.player.log_item('gameplay', {
            name: 'use_item', item_type: item_type, energy: item_def.energy
        });

        this.player.execute('use_item', { item_type: item_type });
        this.player.apply_triggers();
    };

    this.get_task_price = function(task) {
        var cost = this.context.tasks.displayedCost(task, this.player.time());
        return (cost.real_balance) ? cost.real_balance : 0;
    };

    this.get_pack_price = function(pack_type) {
        var pack_def = this.context.defs.get_def('packs.pack_types.' + pack_type);
        return (pack_def.price.real_balance) ? pack_def.price.real_balance : 0;
    };

    this.has_enough_cash_for_pack = function(pack_type) {
        var pack_price = this.get_pack_price(pack_type);
        var real_balance = this.context.player.get_real_balance();
        this.log('player.real_balance %d. pack price %d', real_balance, pack_price);
        return real_balance >= pack_price;
    };

    this.buy_cash = function() {
        this.log('low real_balance. buying cash...');
        var receipt50bucks = "";
        this.player.appstore_buy(receipt50bucks, '50bucks');
        this.player.apply_services();
    };

    this.has_enough_cash_for = function(task) {
        var cost = this.context.tasks.displayedCost(task, this.player.time());
        var real_balance = this.context.player.get_real_balance();
        if (_.isEmpty(cost)) {
            return true;
        } else if (real_balance >= cost.real_balance) {
            this.log('has enough cash for speed up task %s. need %j. have %d',
                task.type, cost.real_balance, real_balance
            );
            return true;
        }

        this.log('has low real_balance for task %s. need %j. have %d',
            task.type, cost.real_balance, real_balance
        );
        return false;
    };

    this.has_cash_for_unlock = function(case_id) {
        var cost = this.context.partners.unlockRequestCost(case_id);
        var real_balance = this.context.player.get_real_balance();
        if (cost.real_balance && real_balance < cost.real_balance) {
            this.log('has low real_balance for case %s. need %j. have %d',
                case_id, cost.real_balance, real_balance
            );
            return false;
        } else {
            return true;
        }
    };

    this.log_cash_spent = function(real_balance) {
        this.player.log_item('gameplay', {
            name: 'cash_spent', real_balance: real_balance
        });
    };

    this.get_inventory_items = function() {
        var items = this.context.storage.get_property_or_default('player.inventory', {});
        this.log('inventory', u.inspect(items, true));
        return items;
    };

    this.has_triggers = function() {
        return this.context.case.triggers().length;
    };

    this.get_triggers = function() {
        return this.storage.get_property('triggers');
    };

    this.log = function() {
        if (this.player.verbose) {
            arguments['0'] = 'bot ' + this.player.social_id + ' ' + arguments['0'];
            console.log.apply(this, arguments);
        }
    };
};

module.exports = PlayerHelper;
