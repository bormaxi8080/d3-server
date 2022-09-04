var bunyan = require('bunyan');
var path   = require('path');
var domain = require('domain');

var _levels = {
    silly:   0,
    verbose: 1,     // trace
    debug:   2,     // debug
    info:    3,     // info
    warn:    4,     // warn
    error:   5      // error
                    // fatal
};

var Logger = function(params) {
    var _self = this;

    this._bunyan_logger = null;
    var _add_domain = false;
    var _is_readable_console = false;
    var _console_level = 0;
    var _filter_params = {};

    /**
     * Преобразует шаблон и имя файла.
     *
     * @param fname_tpl {String} шаблон имени файла
     * @return {String} полный путь к лог-файлу
     */
    var prepareFileName = function (fname_tpl, val) {
        val = 'master';
        return path.normalize(process.cwd() + '/' + fname_tpl.replace('##', val));
    };

    /**
     * Дополнительная обработка сообщения для bunyan
     *
     * @param message {String}
     * @return {String}
     */
    var prepareBunyanMessage = function (message) {
        return message;
    };

    /**
     * Дополнительная обработка метаданных для bunyan
     *
     * @param metadata {Object}
     * @return {Object}
     */
    var prepareBunyanMetadata = function (metadata) {
        if (!metadata) metadata = {};

        if (typeof metadata !== 'object') {
            metadata = {metadata: metadata};
        }

        // Добавим social_id
        if (_add_domain) {
            if (domain.active) {
                metadata.social_id = domain.active.user_id;
                if (domain.active.client_ip) {
                    metadata.ip = domain.active.client_ip;
                }
                if (!domain.active.in_request && domain.active.request_url) {
                    metadata.url = domain.active.request_url;
                    var post_params = _self.filter_params(domain.active.post_params) || {};
                    for (var el in post_params){
                        metadata[el] = post_params[el];
                    }
                    domain.active.in_request = true;
                }
            }
        }
        return metadata;
    };

    /**********************************************************************************/

    /**
     * filter request params before output
     *
     * @param obj
     */
    this.filter_params = function(obj) {
        for (var el in obj) {
            if (_filter_params[el] == true) {
                obj[el] = 'Filtered';
            }
        }
        return obj;
    };

    this.onUncaughtException = function(err) {
        _self.fatal(err);
        _self.fatal(err.stack);

        console.log(err);
        console.log(err.stack);

        setTimeout (function() {
            // Корректно завершаем работу логгеров
            for (var i in _self._bunyan_logger.streams) {
                var s = _self._bunyan_logger.streams[i];
                if (s.closeOnExit) {
                    s.stream.end();
                }
            }
            process.exit();
        }, 700);
    };

    /**********************************************************************************/

    /**
     * Инициализация логгера
     *
     * @param params {Object} конфигурация логгера
     */
    this.init = function (params) {
        if (!('console_level' in params) || (!(params['console_level'] in _levels))) {
            params['console_level'] = 'silly';
        }
        if (!('console_silent' in params)) {
            params['console_silent'] = false;
        }
        if (!('console_json' in params)) {
            params['console_json'] = true;
        }

        // --
        if (!('file_level' in params) || (!(params['file_level'] in _levels))) {
            params['file_level'] = 'warn';
        }
        if (!('file_name' in params)) {
            throw new Error('Bad logger params. "file_name" not found.');
        }
        if (!('file_silent' in params)) {
            params['file_silent'] = false;
        }

        if (('filter_params' in params) && (typeof params['filter_params'] === 'object')) {
            _filter_params = params['filter_params'];
        }

        if ('separate_users' in params) {
            _add_domain = params['separate_users'];
        }

        var lv;
        var bunyan_streams = [];

        // Если вывод в консоль включен, добавим транспорт.
        if (!params['console_silent']) {
            if (params['console_json']) {

                // Наименования в логгерах отличаются.
                lv = params['console_level'];
                if (lv == 'silly' || lv == 'verbose') lv = 'trace';

                bunyan_streams.push ({
                    type:   'stream',
                    stream: process.stdout,
                    level:  lv
                });
            } else {
                _is_readable_console = true;
                _console_level = (params['console_level'] in _levels) ? _levels[params['console_level']] : 0;
            }
        }

        if (!params['file_silent']) {
            // Наименования в логгерах отличаются.
            lv = params['file_level'];
            if (lv == 'silly' || lv == 'verbose') lv = 'trace';

            bunyan_streams.push ({
                type:   'file',
                path:   prepareFileName(params['file_name']),
                level:  lv
            });

            bunyan_streams.push ({
                type:   'file',
                path:   prepareFileName(params['file_name'], 'exceptions'),
                level:  'error'
            });
        }

        this._bunyan_logger = bunyan.createLogger({
            name: 'Detective',
            streams: bunyan_streams
        });
    };

    /**********************************************************************************/
    this.silly = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['silly'])) console.log('SILLY:  ' + message);
        this._bunyan_logger.trace(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    /**********************************************************************************/

    this.verbose = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['verbose'])) console.log('VERBOSE:  ' + message);
        this._bunyan_logger.trace(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    this.debug = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['debug'])) console.log('DEBUG:  ' + message);
        this._bunyan_logger.debug(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    /**********************************************************************************/

    this.info = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['info'])) console.log('INFO:  ' + message);
        this._bunyan_logger.info(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    /**********************************************************************************/

    this.warn = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['warn'])) console.log('WARN:  ' + message);
        this._bunyan_logger.warn(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    /**********************************************************************************/

    this.error = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['error'])) console.log('ERROR: ' + message);
        this._bunyan_logger.error(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    /**********************************************************************************/

    this.fatal = function (message, metadata) {
        if (_is_readable_console && (_console_level <= _levels['fatal'])) console.log('FATAL: ' + message);
        this._bunyan_logger.fatal(prepareBunyanMetadata(metadata), prepareBunyanMessage(message));
    };

    this.init(params);
};

var MigrationLoggerMixin = function() {
    this.metadata = {migration_name: '', migration_version: 0}

    this.setMetadata = function(name, version) {
        this.metadata.migration_name = name;
        this.metadata.migration_version = version;
    }

    this.silly = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.trace.apply(this._bunyan_logger, arguments);
    };

    this.verbose = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.trace.apply(this._bunyan_logger, arguments);
    };

    this.debug = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.info.apply(this._bunyan_logger, arguments);
    };

    this.info = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.info.apply(this._bunyan_logger, arguments);
    };

    this.warn = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.warn.apply(this._bunyan_logger, arguments);
    };

    this.error = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.error.apply(this._bunyan_logger, arguments);
    };

    this.fatal = function() {
        Array.prototype.unshift.call(arguments, this.metadata);
        this._bunyan_logger.error.apply(this._bunyan_logger, arguments);
    };
}

module.exports.MigrationLoggerMixin = MigrationLoggerMixin;
module.exports.Logger = Logger;


