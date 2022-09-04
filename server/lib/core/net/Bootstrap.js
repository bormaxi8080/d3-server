var URL = require("url");
var PathTree = require("./PathTree");

/**
 * Класс для создания рабочего цикла обработчиков.
 * Должен настраиваться фабрикой pipeline'ов
 */

var Bootstrap = function(defaultRoute, requestCounter)
{
    if (!defaultRoute) throw new Error("defaultRoute must not be null!");
    if ((typeof defaultRoute != "object") ||  !("createChain" in defaultRoute)) {
        throw new Error("defaultRoute must be an object with existing \"createChain\" method!");
    }

    var _self = this;
    _self.request_count = 0;
    this._tree = new PathTree();
    this._defaultRoute = defaultRoute;
    this._requestCounter = requestCounter;

    /**
     * Обработать запрос созданным фабрикой pipeline'ом
     *
     * @param request   Объект запроса
     * @param response  Объект ответа
     */
    this.handle = function(request, response)
    {
        if ((typeof request != "object") ||  !("url" in request)) {
            throw new Error("request must be an object with existing \"url\" param!");
        }

        _self._requestCounter.inc();

        // имя обработчика - это все до GET-переменных
        var path = URL.parse(request.url).pathname;

        // получаем обработчик маршрута или null исходя из маршрута
        var route = _self._tree.getNode(path);

        // если не удалось найти обработчик - ипользуем обработчик по умолчанию
        if (!route) route = _self._defaultRoute;
        // отдаем запрос конечному обработчику
        route.createChain().handle(request, response, function() {
            _self._requestCounter.dec();
        });
    };
};

/**
 * Задать фабрику цепочек обработчиков для определенного маршрута.
 *
 * @param   path            {String}    Строковое представление маршрута
 * @param   routeHandler    {Object}    Фабрика цепочек обработчиков
 */
Bootstrap.prototype.route = function(path, routeHandler)
{
    if (!path || (typeof(path) !== "string")) throw new Error("Path must not-empty string!");

    if (!routeHandler) throw new Error("RouteHandler must not be null!");
    if ((typeof routeHandler != "object") ||  !("createChain" in routeHandler)) {
        throw new Error("RouteHandler must be an object with existing \"createChain\" method!");
    }

    this._tree.addNode(path, routeHandler);
};

/**
 * Задать фабрику цепочек для нескольких маршрутов
 *
 * @param pathArray         {Array}     Массив маршрутов
 * @param   routeHandler    {Object}    Фабрика цепочек обработчиков
 */
Bootstrap.prototype.routeAll = function(pathArray, routeHandler)
{
    if (!pathArray) throw new Error("PathArray must not be null!");
    if (pathArray.constructor !== Array) throw new Error("pathArray must be an Array instance!");

    var len = pathArray.length;
    while(len--)
    {
        this.route(pathArray[len], routeHandler);
    }
};

module.exports = Bootstrap;