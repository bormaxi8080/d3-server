var fs = require('fs');
var path = require('path');
var localeCore = require('./LocaleCore');
var localeMaker = require('./LocaleMaker');
var localePath = require('./LocalePath');

var SCHEMA_DIR_NAME = 'schema';
var DEFAULT_LOCALE = 'RU';
var LOCALE_KEY_SEPARATOR = '_';


/**
    Объект, предоставляющий интерфейс для получения путей до файлов локализации
*/
exports.localePath = localePath;

/**
    Создает файл локали по описаниям дефов
    @param defPath путь к папке с дефами
*/
exports.makeLocale = function(defPath)
{
    localeMaker.makeLocale(defPath, path.join(defPath, localePath.DEF_LOCALE(DEFAULT_LOCALE)));
}

/**
    Собирает локаль гуи и локаль дефов в один объект
    @param localeDefPath путь до локали дефов
    @param localeGuiPath путь до локали ГУИ
    @return объект собраных локалей
 */
exports.concatGuiAndDef = function(localeDefPath, localeGuiPath)
{
    if (!fs.existsSync(localeDefPath))
    {
        throw new Error("не существует локали по заданному пути " + localeDefPath);
    }
    if (!fs.existsSync(localeGuiPath))
    {
        throw new Error("не существует локали по заданному пути " + localeGuiPath);
    }

    var localeDefObject = JSON.parse( fs.readFileSync(localeDefPath) );
    var localeGuiObject = JSON.parse( fs.readFileSync(localeGuiPath) );

    var localeObject = localeDefObject;
    for (var key in localeGuiObject)
    {
        if (localeObject.hasOwnProperty(key))
        {
            console.log("WARN! Для локали гуи и локали дефов один и тот же ключ : " + key +
                        "guiLocale[key] : " + localeGuiObject[key] + ", defLocale[key] : " + localeDefObject[key]);
        }
            localeObject[key] = localeGuiObject[key];
    }
    return localeObject;
}

/**
    Сортирует json содержимое файла локали
    @param filePath путь до файла локали
*/
exports.sortFile = function(filePath)
{
    var localeHash = fs.readFileSync(filePath);
    var localeArray = localeHash.toString().split("\n");
    localeArray.shift();
    localeArray.pop();

    localeArray.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    //возвращаем правильную последовательность запятых в отсортированном массиве строк
    for (var i = 0; i < localeArray.length; ++i)
    {
        var localeItem = localeArray[i];
        var lastIndex = localeItem.length-1;
        if ((i == localeArray.length-1))
        {
            if (/,\s*$/.test(localeItem))
            {
                localeArray[i] = localeItem.replace(/,\s*$/, "");
            }
        }
        else if (!(/,\s*$/.test(localeItem)))
        {
            localeArray[i] = localeItem.replace(/\s*$/, ",");
        }
    }

    localeArray.unshift("{");
    localeArray.push("}");
    fs.writeFileSync(filePath, localeArray.join("\n"));
}

/**
    @return {localeObject: localeObject, localeDictionary: localeDictionary, patternProperties: patternProperties}
*/
exports.getLocaleInfo = function(defPath)
{
    var defaultLocalePath = path.join(defPath, localePath.DEF_LOCALE(DEFAULT_LOCALE));
    if (!fs.existsSync(defaultLocalePath))
        return null;
    var localeContent = fs.readFileSync(defaultLocalePath);
    var schemaPath = path.join(defPath, 'schema');
    var localeObject = JSON.parse(localeContent);

    var propObject = localeCore.findLocaleProperties(schemaPath);
    var localeDictionary = propObject.properties;
    var patternProperties = propObject.patternProperties;

    return {localeObject: localeObject, localeDictionary: localeDictionary, patternProperties: patternProperties};
}

/**
    Заменяет в дефе все значения локалей соответствующими ключами
    Используется при сборке дефов в один файл
    @param defPath путь к папке с дефами
    @param defFileContent строковое содержимое файла дефа
    @param defFilePath полный путь до файла дефа
    @param localeInfo информация о локали. локализованые поля, объект локали, список паттерн полей
*/
exports.replaceDefLocale = function(defPath, defFileContent, defFilePath, localeInfo)
{
    var result = defFileContent;
    try {
        var defObject = JSON.parse(defFileContent);
    } catch (e) {
        console.log('\033[31m'+"Бойся! Гуевый json! "+'\x1b[33m'+defFilePath+'\033[0m');
        console.log(e.stack);
    }

    var localeProperties = localeInfo.localeDictionary[defObject.schema_id];
    var localeObject = localeInfo.localeObject;
    var patternProperties = localeInfo.patternProperties;

    if (!localeObject)
    {
        throw new Error("Объект локали не определен!");
    }
    if (!localeInfo.localeDictionary || localeInfo.localeDictionary.length === 0)
    {
        throw new Error("localeDictionary должен быть не пустым");
    }

    if (!localeProperties || localeProperties.length == 0)
    {
        return result;
    }

    var defLocaleList = localeCore.getDefLocaleList(defObject, localeProperties, patternProperties);

    for (var i = 0; i < defLocaleList.length; ++i)
    {
        var localeKey = localeCore.getDefFilePathKey(defPath, defFilePath) + "_" + defLocaleList[i].join("_");
        if (localeObject.hasOwnProperty(localeKey))
        {
            var localeValue = localeObject[localeKey].replace(new RegExp("\n", 'g'), "\\n");
            var defLastKey = defLocaleList[i][defLocaleList[i].length-1];

            var replaceExp = "\"" + defLastKey + "\": \"" + localeValue + "\"";
            if (defFileContent.indexOf(replaceExp) == -1)
            {
                console.log("ERROR! string " + replaceExp + " not found in def : " + defFilePath);
                continue;
            }

            result = result.replace(replaceExp, "\"" + defLastKey + "\": \"" + localeKey + "\"");
        }
        else
        {
            //console.log("ERROR! locale object has not key : " + localeKey + " for def : " + defFilePath);
        }
    }
    return result;
}





