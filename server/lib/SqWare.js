var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var http = require("http");
var domain = require('domain');
var cluster = require("cluster");
var yaml = require("js-yaml");

var Config = require("./core/Config");
var Logger = require("./core/Logger").Logger;
var MigrationLoggerMixin = require("./core/Logger").MigrationLoggerMixin;
var ModelsFactory = require("./data/ModelsFactory");
var QueryFactory = require("./data/QueryFactory");
var RouteFactory = require("./core/RouteFactory");
var HandlerFactory = require("./core/HandlerFactory");
var ExecutorFactory = require("./services/ExecutorFactory");
var DataGate = require("./core/data/DataGate");
var BatchRunnerVersion = require("./core/process/BatchRunnerVersion");
var Bootstrap = require("./core/net/Bootstrap");
var Mixer = require("./core/Mixer");
var JSONUtils = require("./data/JSONUtils");
var HealthMonitor = require("./core/process/HealthMonitor");

var absrequire = function(path) {
    return JSONUtils.clone(require(fs.realpathSync(path)));
};

var absrequire_yml = function(path) {
    return yaml.safeLoad(fs.readFileSync(fs.realpathSync(path), 'utf8'));
}

var SqWare = function(config_path) {
    var _self = this;
    var _config = {
        app:   Config.app_config(path.join(config_path, '..')),
        db:    absrequire_yml(path.join(config_path, "/db.yml")),
        cache: absrequire_yml(path.join(config_path, "/cache.yml")),
        npc_room: {},
        init_room: [{options:{}}],
        init_world: absrequire(path.join(config_path, "init_world.json"))
    };

    _config.app.npc_neighbours = {};
    _config.manifest_main = absrequire(_config.app.manifest_main);

    this._cfg = new Config(_config);
    this.logger = new Logger(this._cfg.app().logger);
    var _logger = this.logger;

    // Дополнительно подготовим информацию о последней версии batch_runners
    var base_js_dir = path.normalize(process.cwd() + '/' + this._cfg.batch_runner().base_js_dir);
    var custom_js_dir = path.normalize(process.cwd() + '/' + this._cfg.batch_runner().custom_js_dir);
    var version = null;

    // Файла с версией может не быть с может в случае jake сразу после выкатки
    var version_path = path.join(base_js_dir, 'version.txt');
    if (fs.existsSync(version_path)) {
        version = fs.readFileSync(version_path, 'utf8').trim();
    }

    this._cfg.batch_runner().cheat = (this._cfg.app().cheat || false);
    this._cfg.batch_runner().base_js_dir = base_js_dir;
    this._cfg.batch_runner().custom_js_dir = custom_js_dir;
    this._cfg.batch_runner().last_version = version;
    this._cfg.batch_runner().last_script_path = path.normalize(path.join(base_js_dir, version + ".js"));
    this._cfg.batch_runner().env = process.env.NODE_ENV;

    _config.app.networks_map = {};
    for (var n in _config.app.networks) {
        _config.app.networks_map[_config.app.networks[n].name] = _config.app.networks[n];
        _config.app.networks[n].id = n;
    }

    this.migration_logger = new Logger(this._cfg.app().logger);
    Mixer.mix(this.migration_logger, new MigrationLoggerMixin, true);

    this.modelFactory = new ModelsFactory(require('./data/models'));

    this.handlerFactory = new HandlerFactory();
    this.handlerFactory.addHandlers(require("./handlers"));
    this.handlerFactory.addChandlers(require("./chandlers"));

    this.routeFactory = new RouteFactory(this);

    _.each({
        "__base":                   "./routes/ErrorRoute",
        "static":                   "./routes/StaticRoute",
        "cdn":                      "./routes/CdnRoute",
        "share":                    "./routes/ShareRoute",
        "health":                   "./routes/backend/HealthRoute",
        "rich_health":              "./routes/backend/RichHealthRoute",
        "process/init":             "./routes/ProcessInitRoute",
        "process/apply_batch":      "./routes/ProcessApplyBatchRoute",
        "process/switch_room":      "./routes/ProcessSwitchRoomRoute",
        "query/can_use":            "./routes/queries/CanUseRoute",
        "query/highscores":         "./routes/queries/HighscoresRoute",
        "query/levels":             "./routes/queries/LevelsRoute",
        "query/hints":              "./routes/queries/HintsRoute",

        "backend/cdn":              "./routes/CdnRoute",
        "backend/server_logs":      "./routes/backend/ServerLogsRoute",
        "backend/server_logs_list": "./routes/backend/ServerLogsListRoute",
        "backend/migrations":       "./routes/backend/MigrationsRoute",
        "backend/room_ids":         "./routes/backend/RoomIdsRoute",
        "backend/services_list":    "./routes/backend/ServicesListRoute",
        "backend/services_edit":    "./routes/backend/ServicesEditRoute",
        "backend/services_save":    "./routes/backend/ServicesSaveRoute",

        "backend/services_get_templates":           "./routes/backend/ServicesGetTemplatesRoute",
        "backend/test-migrations/available-users":  "./routes/backend/test_migrations/AvailableUsersRoute",
        "backend/test-migrations/download-dump":    "./routes/backend/test_migrations/DownloadDumpRoute",
        "backend/test-migrations/migrate":          "./routes/backend/test_migrations/MigrateRoute",
        "backend/user_saved_states_list":           "./routes/backend/UserSavedStatesListRoute",
        "backend/user_saved_states_get":            "./routes/backend/UserSavedStatesGetRoute",

        "backend/users_stats":      "./routes/backend/UsersStatsRoute",
        "backend/get_user":         "./routes/backend/GetUserRoute",
        "backend/user_dump":        "./routes/backend/UserDumpRoute",
        "backend/save_state":       "./routes/backend/SaveStateRoute",
        "backend/states_save_as":   "./routes/backend/StatesSaveAsRoute",
        "backend/states_list":      "./routes/backend/StatesListRoute",
        "backend/states_load":      "./routes/backend/StatesLoadRoute",
        "backend/reset_user":       "./routes/backend/ResetUserRoute",

        "backend/get_payments":     "./routes/backend/GetPaymentsRoute",

        "set_token":    "./routes/SetTokenRoute",
        "get_hybrid":   "./routes/hybrid/HybridIDGetRoute",
        "set_hybrid":   "./routes/hybrid/HybridIDSetRoute",
        "hybrid_users": "./routes/hybrid/HybridUsersRoute",

        "callback_appstore": "./routes/payments/AppStorePaymentRoute",
        "callback_vk":       "./routes/payments/VKPaymentRoute",
        "callback_od":       "./routes/payments/OKPaymentRoute",
        "callback_mm":       "./routes/payments/MMPaymentRoute"
    }, function(path, route) {
        _self.routeFactory.add(route, require(path));
    });

    this.queryFactory = new QueryFactory(this);
    this.queryFactory.add("flushExtra", function() {
        this.run = function() { this.emit("complete"); };
    });

    this.queryFactory.addQueries(require("./data/queries"));
    this.dataGate = new DataGate(this);
    var dataGate = this.dataGate;
    var request_counter = this.dataGate.request_counter;

    this.cqueries = {}
    _.each(require("./data/cqueries"), function(cquery, name) {
        _self.cqueries[name] = new cquery(_self.queryFactory);
    });

    this.bootstrap = new Bootstrap(new (this.routeFactory.getRoute('__base'))(this), request_counter);

    var graceExit = function() {
        if (!request_counter.hasActiveRequest()) {
            _logger.warn("process not stop because have " + request_counter.activeRequestCount() + " active requests");
            setTimeout(graceExit, 1000);
        } else {
            _logger.info("process stop with SIGQUIT");
            process.exit();
        }
    };

    process.on('SIGQUIT', function() {
        _logger.info("process try to exit with SIGQUIT");
        dataGate.not_accept_requests = true;
        graceExit();
    });

    process.on('SIGTERM', function() {
        _logger.warn("process exit with SIGTERM");
        process.exit();
    });

    this.version = JSON.parse(fs.readFileSync(path.join(this.config().app()['static_dir'], 'VERSION'), 'utf8'));
    this.batchRunnerFactory = new BatchRunnerVersion(this.config().batch_runner(), this.logger);
    var migrations_batch_runner = this.config().batch_runner();
    migrations_batch_runner.base_js_dir = path.join(process.cwd(), this.config().app().world_migrations_scripts_dir, '/');
    this.batchRunnerMigrationFactory = new BatchRunnerVersion(migrations_batch_runner, this.logger);

    this.dataGate.initMigrateManager();

    this.config().services = {
        products: absrequire(this.config().app().products)
    };

    setInterval(this.batchRunnerFactory.dropOld, this.config().batch_runner().check_interval * 1000);
    setInterval(this.batchRunnerMigrationFactory.dropOld, this.config().batch_runner().check_interval * 1000);

    this.executorFactory = new ExecutorFactory(this);
    this.executorFactory.addExecutors({
        "payment":          require("./services/executors/PaymentExecutor"),
        "sharing":          require("./services/executors/SharingExecutor"),
        "sharing_apply":    require("./services/executors/SandboxExecutor"),
        "send_gift":        require("./services/executors/SendGiftExecutor"),
        "unlock_request":   require("./services/executors/UnlockRequestExecutor")
    });

    this.healthMonitor = new HealthMonitor(this);
};

SqWare.execSync = require("exec-sync");

SqWare.prototype.config = function() {
    return this._cfg;
};

SqWare.prototype.run = function(port, workers) {
    this.routeFactory.initRoutes(this.bootstrap);

    var self = this;
    workers = workers || require('os').cpus().length;

    if (cluster.isMaster && this._cfg.app().multithreading == true) {
        for (var i = 0; i < workers; i++) {
            cluster.fork();
        }

        cluster.on('exit', function(worker, code, signal) {
            self.logger.error("worker " + worker.process.pid + " died with signal " + signal + " & code " + code + ".");
            console.log("... restart worker ...");
            cluster.fork();
        });

        cluster.on('online', function(worker) {
            self.logger.info("worker " + worker.process.pid + " online.");
        });
    } else {
        var server = http.createServer(function(req, res) {
            var d = domain.create();
            d.on('error', function(error) {
                try {
                    self.logger.error('DOMAIN ERROR: ' + error.stack, error.domain.post_params);
                    error.domain.task.reply(500, { 'Content-Type': 'text/plain' },
                        { error_code: 'internal_error' }
                    );
                    var killtimer = setTimeout(function() {
                        d.dispose();
                    }, 1000);
                } catch (error_2) {
                    self.logger.error('Error sending 500!', error_2.stack);
                }
            });
            d.add(req);
            d.add(res);
            d.run(function() {
                self.bootstrap.handle(req, res);
            });
        });
        console.log('Start listening ' + port);
        server.listen(port, "0.0.0.0");
        this.server = server;
    }
};

SqWare.prototype.stop = function() {
    if (this.server) {
        this.server.close();
        this.server = null;
    } else {
        throw new Error("not implemented"); // корректно обработать кластер
    }
};

SqWare.Utils = {
    Logic: require('./core/Utils'),
    Mixer: require('./core/Mixer'),
    HandlerChain: require('./core/net/HandlerChain'),
    QueryCall: require('./core/Utils').QueryCall,
    Locale: require('./core/locale/LocaleUtils'),
    CallChainer: require('./core/CallChainer')
};

module.exports = SqWare;
