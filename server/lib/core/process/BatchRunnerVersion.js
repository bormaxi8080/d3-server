/**
 * Модуль для кеширования версий BatchRunner'а
 */

var fs = require("fs");
var BatchRunner = require("./BatchRunner");

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

/**
 * @constructor
 *
 * @param settings   {Hash} Настройки батч раннера
  */
var BatchRunnerVersion = function(settings, logger)
{
    var _self = this;

    this._logger = logger;

    // ToDo М.б. стоит привести конфиг и его использование в более логичный вид...
    this._settings   = settings;
    this._basePath   = settings['base_js_dir'];
    this._customPath = settings['custom_js_dir'];

    this._versionCache = {};
    this._deadVersions = {};

    var defaultScriptingFactory = require(settings['last_script_path']);
    this._defaultBatchRunner = new BatchRunner(defaultScriptingFactory, settings, this._logger);

    this.dropOld = function() {
        var d = Date.now();
        for (var v in _self._versionCache) {
            if (d > (_self._versionCache[v]['last_active'] + _self._settings['inactive_timeout']*1000)) {
                _self._logger.info("BatchRunnerVersion. Drop " + v);
                delete _self._versionCache[v];
            }
        }
    }
};

/**
 * Получить конкретную версию BatchRunner'а
 *
 * @param version   {String}    Строковый идентификатор версии скриптинга.
 *                              Если передан null, то возвращается версия по-умолчанию
 *                              Если версия не найдена, то возвращается null.
 */
BatchRunnerVersion.prototype.get = function(version)
{
    // проверяем на "пустоту" вместо версии
    if ((version == "null") || (version === undefined))
    {
        return this._defaultBatchRunner;
    }

    // если версия передана, она должна быть строкой
    if (typeof(version) !== "string")
    {
        this._logger.warn("WARNING. Bad script version '" + version + "' not string.");
        return this._defaultBatchRunner;
    }

    // смотрим в кеш - если там версия есть, то возвращаем ее
    if (version in this._versionCache)
    {
        this._logger.info('BatchRunnerVersion use ' + version);
        this._versionCache[version]['last_active'] = Date.now();
        return this._versionCache[version]['runner'];
    }

    // версии в кеше нет. Чтобы каждый раз не проверять одно и то же,
    // смотрим в список мертвых версий. Мертвыми считаются версии,
    // которые мы однажды пытались найти, но не нашли
    if (version in this._deadVersions)
    {
        this._logger.warn("WARNING. Bad script version '" + version + "'");
        return this._defaultBatchRunner;
    }

    var path = this._basePath + version + ".js";
    if (path ==  this._settings['last_script_path'])
    {
        this._logger.info('BatchRunnerVersion use deafult ' + version);
        return this._defaultBatchRunner;
    }

    // ищем файл в базовой директории
    var exists = fs.existsSync(path);

    // ищем файл в дополнительной директории
    if (!exists)
    {
        path = this._customPath + version + ".js";
        exists = fs.existsSync(path);
    }

    // если файл не найден - помечаем версию как мертвую
    // и возвращаем null
    if (!exists)
    {
        this._deadVersions[version] = true;
        this._logger.warn("WARNING. Bad script version '" + version + "'");
        return this._defaultBatchRunner;
    }

    // Файл существует, в кеше его нет, версия не мертвая.
    // Придется загружать в память.
    this._logger.info('BatchRunnerVersion load from ' + path + "  " + version);
    var runner = new BatchRunner(require(path), this._settings, this._logger);
    this._versionCache[version] = { runner: runner, last_active: Date.now() };

    return runner;
};

module.exports = BatchRunnerVersion;
