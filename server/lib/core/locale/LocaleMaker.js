var fs = require("fs");
var path = require("path");
var localeCore = require('./LocaleCore');

var red = '\033[31m';
var reset = '\033[0m';

/**
Соединяет два объекта локали в один
@param parentLocaleObject объект, в который происходит добавление полей второго объекта
@param childLocaleObject объект, поля которого, дополняются в первый объект
*/
var concatLocaleObjects = function(parentLocaleObject, childLocaleObject)
{
    for (var key in childLocaleObject)
    {
        if (parentLocaleObject.hasOwnProperty(key))
        {
            console.log("ERROR!! дублирование ключей локалей : " + key);
        }
        parentLocaleObject[key] = childLocaleObject[key];
    }
}

/**
Создает объект локали для конкретного объекта дефа
@param def
@param defProperties список стека полей дефа с локалями
*/
var makeLocaleObjectForDef = function(def, defPathKey, defProperties)
{
    var result = {};
    for (var i = 0; i < defProperties.length; ++i)
    {
        var defValue = def;
        var defPropertyStack = defProperties[i];
        for (var j = 0; j < defProperties[i].length; ++j)
        {
            defValue = defValue[defPropertyStack[j]];
        }
        if (defValue.indexOf("formula:") == 0) { continue; }
        var key = defPathKey + "_" + defProperties[i].join("_");
        result[key] = defValue;
    }
    return result;
}

/**
Создает объект локали, проходя рекурсивно по всем дефам
@param defPath путь до директории дефов
@param currentDirPath текущая директория
@param localeProperties поля, которые должны быть локализованы
@param patternProperties паттерн поля из localeProperties
*/
var makeLocaleObjectRecursively = function(defPath, currentDirPath, localeProperties, patternProperties)
{
    var result = {};
    var fileList = fs.readdirSync(currentDirPath);
    for (var i = 0; i < fileList.length; ++i)
    {
        var fileName = fileList[i];
        if (fileName == 'localization') { continue; }
        if (fileName == 'schema') { continue; }


        var filePath = path.join(currentDirPath, fileName);
        var fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory())
        {
            concatLocaleObjects(result, makeLocaleObjectRecursively(defPath, filePath, localeProperties, patternProperties));
        }
        else if (fileName.indexOf(".") != 0 && fileName.split('.')[1] == "json")
        {
                var fileContent = fs.readFileSync(filePath).toString();
                try {
                    var defObject = JSON.parse(fileContent);
                } catch (e) {
                    console.log (red+"Wrong json object"+reset+" : "+filePath);
                    console.log (e.stackTrace());
                }
                var schemaLocaleProperties = localeProperties[defObject.schema_id];
                if (schemaLocaleProperties)
                {
                    var defLocalePropList = localeCore.getDefLocaleList(defObject, schemaLocaleProperties, patternProperties, fileName);
                    var defPathKey = localeCore.getDefFilePathKey(defPath, filePath);
                    var defLocaleObject = makeLocaleObjectForDef(defObject, defPathKey, defLocalePropList);

                    concatLocaleObjects(result, defLocaleObject);
                }
        }
    }
    return result;
}

 /**
    Создает файл локали по описаниям дефов
    @param defPath путь к папке с дефами
    @param localeFilePath файл, в который сохранится созданая локаль
*/
exports.makeLocale = function(defPath, localeFilePath)
{
    var schemaPath = path.join(defPath, 'schema');
    var patternProperties = [];
    var propObject = localeCore.findLocaleProperties(schemaPath);
    var localeProperties = propObject.properties;
    var patternProperties = propObject.patternProperties;

    var localeObject = makeLocaleObjectRecursively(defPath, defPath, localeProperties, patternProperties);

    var fileContentToSave = localeCore.stringifyLocaleObject(localeObject);
    fs.writeFileSync(localeFilePath, fileContentToSave);
}

