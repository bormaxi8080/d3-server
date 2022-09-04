/**
 * Модуль для потокового парсинга multipart-запросов
 */

var Mixer = require("../Mixer");
var EventEmitter = require("events").EventEmitter;

/**
 * Утилитный класс для построения карты парсинга полей запроса
 *
 * @param searchString  {String}    Разделитель полей
 */
var SearchHelper = function(searchString)
{
    var len = searchString.length;
    var charMap = {};
    var char;

    for (var i = 0; i < len; i++)
    {
        char = searchString.charAt(i);

        if (!(char in charMap)) charMap[char] = [];

        charMap[char].push(i);
    }

    /**
     * В итоге сharMap представляет из себя объект вот такой структуры:
     * {
     *      a: [1, 3],
     *      b: [2],
     *      c: [4, 7]
     *  }
     *
     *  То есть ключами являются буквы в слове для поиска, а значениями -
     *  индексы этой буквы в этом слове.
     */

    this.searchString = searchString;
    this.numCharacters = len;
    this.charMap = charMap;
};

var nameStartHelper = new SearchHelper("name=\"");
var nameEndHelper = new SearchHelper("\"");
var headerEndHelper = new SearchHelper("\r\n\r\n");

/**
 * Класс потокового парсера multipart-запросов
 */
var MultipartStreamParser = function(boundary)
{
    if (!boundary || (typeof(boundary) !== "string"))
    {
        throw new Error("Разделитель полей должен быть непустой строкой!");
    }

    this._helpers = [
        new SearchHelper("--" + boundary),
        nameStartHelper,
        nameEndHelper,
        headerEndHelper
    ];
    this._data = "";
    this._state = 0;
    this._position = 0;
    this._firstIndex = 0;
    this._lastIndex = 0;
    this.fields = {};
};

MultipartStreamParser.prototype.search = function(helper)
{
    if (this._data.length <= this._position + helper.numCharacters)
    {
        return false;
    }

    this._position += helper.numCharacters;

    var char = this._data.charAt(this._position);

    if (!(char in helper.charMap))
    {
        return false;
    }
    else
    {
        var chars = helper.charMap[char];
        var len = chars.length;
        var maxRange = chars[len - 1] - chars[0];

        if (this._position + maxRange >= this._data.length)
        {
            return false;
        }

        var position = this._position - helper.numCharacters;

        outerLoop: for (var i = 0; i < len; i++)
        {
            var charIndex = chars[i];

            while(charIndex != 0)
            {
                charIndex--;
                if (this._data.charAt(position + charIndex) != helper.searchString.charAt(charIndex))
                {
                    continue outerLoop;
                }
            }

            charIndex = helper.charMap[char][0];
            while(charIndex < helper.numCharacters)
            {
                charIndex++;
                if (this._data.charAt(position + charIndex) != helper.searchString.charAt(charIndex))
                {
                    continue outerLoop;
                }
            }

            // оба цикла отработали, мы действительно находимся там где нужно
            return true;
        }

        return false;
    }
};

/**
 * Добавить данные к имеющимся. Данные будут по возможности
 * преобразованы в поля запроса. Метод можно вызывать только после того,
 * как задан разделитель полей (boundary)
 *
 * @param data  {String}    Строковые данные для парсинга
 */
MultipartStreamParser.prototype.pushData = function(data)
{
    if (!this._parseHelper) throw new Error("Разделитель полей запроса еще не передан!");

    if (!data || (typeof(data) !== "string"))
    {
        throw new Error("Данные должны быть непустой строкой!");
    }

    this._data += data;
    this._parse();
};

MultipartStreamParser.prototype._parse = function()
{

};

Mixer.mix(MultipartStreamParser.prototype, EventEmitter.prototype);

module.exports = MultipartStreamParser;