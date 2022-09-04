/**
 * Модуль для построения дерева обработчиков маршрутов
 */

/**
 * @constructor
 */
var PathNode = function()
{
    this.content = null;
    this.parent = null;
    this._children = {};
};

/**
 * Добавить вложенный элемент дерева
 *
 * @param name  {String}    Имя добавляемого узла
 * @param child {Object}    Добавляемый узел
 */
PathNode.prototype.addChild = function(name, child)
{
    child.parent = this;
    this._children[name] = child;
};

/**
 * Получить узел дерева по имени
 *
 * @param name  {String}    Имя искомого узла
 */
PathNode.prototype.getChild = function(name)
{
    return this._children[name];
};

/**
 * Есть ли вложенный узел с таким именем
 *
 * @param name  {String}    Имя узла
 */
PathNode.prototype.hasChild = function(name)
{
    return (name in this._children);
};


/**
 * @constructor
 */
var PathTree = function()
{
    this._root = new PathNode(null);
};

/**
 * Добавить обработчик для маршрута
 *
 * @param path      {String}    Маршрут
 * @param content   {Object}    Обработчик маршрута
 */
PathTree.prototype.addNode = function(path, content)
{
    var names = path.split("/");
    var len = names.length;
    var name;
    var node = this._root;

    // спускаемся вниз по дереву, если нужно создаем узлы
    for (var i = 0; i < len; i++)
    {
        name = names[i];

        // защита от путей типа "/" и "//"
        if (name.length == 0) continue;

        if (!node.hasChild(name))
        {
            node.addChild(name, new PathNode());
        }

        node = node.getChild(name);
    }

    if (node.content) throw new Error("Данный узел дерева уже зарегистрирован!");
    node.content = content;
};

/**
 * Получить обработчик для переданного маршрута
 *
 * @param path  {String}    Маршрут
 */
PathTree.prototype.getNode = function(path)
{
    var names = path.split("/");

    var len = names.length;
    var node = this._root;
    var name;

    for (var i = 0; i < len; i++)
    {
        name = names[i];

        // защита от путей типа "/" и "//"
        if (name.length == 0) continue;

        // если такого узла не зарегистрировано
        if (!node.hasChild(name)) break;

        // узел существует
        node = node.getChild(name);
    }

    // после первого цикла мы прошли максимальное число узлов вниз по дереву
    // теперь нам нужно найти обработчик
    // для этого будем подниматься вверх по дереву до тех пор,
    // пока не найдем узел с обработчиком

    var content = node.content;
    while(node.parent && !content)
    {
        node = node.parent;
        content = node.content;
    }

    return content;
};

module.exports = PathTree;