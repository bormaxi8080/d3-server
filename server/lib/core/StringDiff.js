/**
 * Утилитный класс для сравнения строк. Нужно просто создать
 * экземпляр и в параметры передать нужные строки.
 * Данные по разнице можно получить через поля объекта:
 *
 * first
 * second
 * lengthDiff
 * diffStart
 * value
 *
 * Так же можно получить JSON-представление данного объекта, вызвав метод toString()
 */

/**
 * Результат сравнения 2 строк, содержит всю необходимую информацию
 *
 * @param str1  {String} Первая строка для сравнения
 * @param str2  {String} Вторая строка для сравнения
 * @constructor
 */
var StringDiff = function(str1, str2) {

    if (str1 == null || str1 == undefined) throw new Error("Compare string 1 should be not null");
    if (str2 == null || str2 == undefined) throw new Error("Compare string 1 should be not null");

    if (typeof(str1) !== "string") throw new Error("Compare string 1 should be of 'string' type");
    if (typeof(str2) !== "string") throw new Error("Compare string 2 should be of 'string' type");

    var len1 = str1.length;
    var len2 = str2.length;


    // запоминаем первую строку
    this.first = str1;
    // запоминаем вторую строку
    this.second = str2;
    // запоминаем разницу по длине
    this.lengthDiff = (len1 - len2);

    // запоминаем символ первого расхождения
    this.diffStart = 0;

    // запоминаем значение расхождения
    this.value = null;

    if (str1 == str2) return;

    for (var i = 0; i < len1; i++) {

        if (len2 <= i) {
            this.diffStart = i;
            this.value = str1.slice(i);

            return;
        }

        var char1 = str1.charAt(i);
        var char2 = str2.charAt(i);

        if ((char1 != char2) || (i == (len1-1))) {
            this.diffStart = i;
            this.value = str2.slice(i);

            return;
        }

    }

};

/**
 * Получить JSON-представление объекта
 *
 * @return {String} JSON-представление объекта
 */
StringDiff.prototype.toString = function() {
    return JSON.stringify(this);
};

module.exports = StringDiff;