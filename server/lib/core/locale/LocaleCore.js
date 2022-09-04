var fs = require("fs");
var path = require("path");
var localeCore = require('./LocaleCore');

/**
    Возвращает ключ пути дефа, который служит прификсом для составления ключа локали этого дефа
    @param defDirPath папка дефов
    @param fullDefFilePath полный путь до дефа
*/
exports.getDefFilePathKey = function(defDirPath, fullDefFilePath)
{
    var stringFilePath = path.normalize(fullDefFilePath).toString();
    var toReplace = path.normalize(defDirPath).toString() + path.sep;
    if (stringFilePath.indexOf(toReplace) == -1)
    {
        console.log("WARN! невозможно из пути дефа " + fullDefFilePath + " извлечь " + toReplace);
    }
    var localPath = stringFilePath.replace(toReplace, "").replace(/\.json$/, "");
    var localPathArray = localPath.split(path.sep);
    return localPathArray.join("_");
}

/**
    Типизирует объект локали в строку с сохранением читабильного вида
    @param localeObject объект локали
*/
exports.stringifyLocaleObject = function(localeObject)
{
    return JSON.stringify(localeObject, null, 4).trim();
}


/**
    Извлекает и сохраняет patternProperty из стека полей
    @param propertyStack стек полей схемы
    @param index иддекс, до которого должно идти извлечение
    @param patternProperties
*/
var extractAndSavePatternProperty = function(propertyStack, index, patternProperties)
{
    var result = [];
    for (var i = 0; i <= index; ++i)
    {
        if (!/@removed|patternProperties/.test(propertyStack[i]))
        {
            result.push(propertyStack[i]);
        }
    }
    result = result.join(".");
    if (patternProperties.indexOf(result) == -1) { patternProperties.push(result); }
    return result;
}


/**
    Возвращает список паттерн полей, в котором участвует targetPatternProperty в начале.
    В возвращаемом списке паттерн полей удален targetPatternProperty
    @param patternProperties список паттерн полей
    @param targetPatternProperties паттерн стек, который служит предметом поиска
*/
var getPatternPropertiesForDeepDef = function(patternProperties, targetPatternProperty)
{
    var result = [];
    patternProperties.forEach(function(item, index, arr)
    {
        if (item.indexOf(targetPatternProperty) == 0 && item.length > targetPatternProperty.length)
        {
            result.push(item.replace(targetPatternProperty + ".", ""));
        }
    });
    return result;
}

/**
    Возвращает поля с локалями из заданного дефа
    @param def объект дефа
    @param localeProperties список полей локалей для схемы заданного дефа
    @param patternProperties списки паттерн полей
    @param defFileName имя файла дефа
*/
var getDefLocaleList = function(def, localeProperties, patternProperties, defFileName)
{
    var result = [];
    var currentPropertyValue;
    var defPropertyStack;
    for (var i = 0; i < localeProperties.length; ++i)
    {
        var localeProperty = localeProperties[i];
        currentPropertyValue = def;
        defPropertyStack = [];
        for (var j = 0; j < localeProperty.length; ++j)
        {
            //console.log("localeProperty : " + JSON.stringify(localeProperty) + ", j : " + j);
            //console.log("cliced property : " + JSON.stringify(localeProperty.slice(0, j+1)));
            var patternProperty = localeProperty.slice(0, j+1).join(".");
            if (patternProperties.indexOf(patternProperty) != -1)
            {
                //console.log("its pattern property");
                //считаем в элементах, удавлетворяющих регулярке, записываем результаты
                for (var key in currentPropertyValue)
                {
                    //console.log("try to test key " + key + "with reg exp : " + localeProperty[j]);
                    if (new RegExp(localeProperty[j]).test(key))
                    {
                        //console.log("test success");
                        var tailLocaleProperties = exports.getDefLocaleList(currentPropertyValue[key], [localeProperty.slice(j+1)], getPatternPropertiesForDeepDef(patternProperties, patternProperty), defFileName);
                        if (tailLocaleProperties && tailLocaleProperties.length > 0)
                        {
                           // console.log("tail locale properties : " + JSON.stringify(tailLocaleProperties));
                            tailLocaleProperties.forEach(function(item, index, arr)
                            {
                                result.push(defPropertyStack.concat([key], item));
                            });
                            //result.push(defPropertyStack.concat(tailLocaleProperties));
                           // console.log("to result : " + JSON.stringify(result[result.length-1]));
                        }
                    }

                }
                defPropertyStack = [];
                break;
            }
            else
            {
                if (currentPropertyValue == undefined)
                {
                    console.log("current property undefined. localeProperty : " + JSON.stringify(localeProperty) + ", j : " + j + ", def : " + def);
                }
                if (!currentPropertyValue.hasOwnProperty(localeProperty[j]))
                {
                    defPropertyStack = [];
                    break;
                }
                currentPropertyValue = currentPropertyValue[localeProperty[j]];
                defPropertyStack.push(localeProperty[j]);

            }
        }

        if (defPropertyStack.length > 0)
        {
            //console.log("go to result : " + JSON.stringify(defPropertyStack));
            result.push(defPropertyStack);
        }
    }
    return result;
}
exports.getDefLocaleList = getDefLocaleList;

/**
    Возвращает объект схемы по ее идентификатору
    @param schemaIdentifier идентификатор схемы, например base#/definitions/empty.json
    @param currentSchema текущая базовая схема
*/
var getSchemaObject = function(schemaPath, schemaIdentifier, currentSchema)
{
    var result = null;
    if (schemaIdentifier.indexOf("#") != -1)
    {
        var baseSchemaObject = null;
        var baseSchema = schemaIdentifier.split("#")[0];
        if (baseSchema != "")
        {
            var schemaFilePath = path.join(schemaPath, baseSchema + ".json");
            baseSchemaObject = JSON.parse( fs.readFileSync(schemaFilePath) );
            if (schemaIdentifier.indexOf(baseSchema + "#/") == -1)
            {
                //console.log("WARN!! wrong schema identifier : " + schemaIdentifier, "schema id : " + currentSchema.id);
            }
        }
        else
        {
            if (currentSchema == undefined) { console.log("base schema not provided for key : " + schemaIdentifier); }
            baseSchemaObject = currentSchema;
        }

        result = baseSchemaObject;
        var schemaPropListString = schemaIdentifier.replace(new RegExp(baseSchema + "#\/*"), "");
        if (schemaPropListString != "")
        {
            var schemaPropertyList = schemaPropListString.split("/");
            for (var i = 0; i < schemaPropertyList.length; ++i)
            {
                if (!result.hasOwnProperty(schemaPropertyList[i]))
                {
                    console.log("property " + schemaPropertyList[i] + " not defined in " + JSON.stringify(result));
                }
                result = result[schemaPropertyList[i]];
            }
        }
    }
    else
    {
        result = JSON.parse( fs.readFileSync(path.join(schemaPath, schemaIdentifier + ".json")));
    }
    return result;
}

/**
    Возвращает базовую схему(сам файл) по идентификатору.
    Например, base#/definitions/description вернет объект схемы base, а
    #/definitions/description вернет схему, переданную вторым параметром

    @param schemaRef идентификатор схемы
    @param defaultSchema базовая схема по умолчанию
*/
var getBaseSchemaByRef = function(schemaPath, schemaRef, defaultSchema)
{
    var newBaseSchemaId = schemaRef.split("#")[0];
    return newBaseSchemaId == "" ? defaultSchema : getSchemaObject(schemaPath, newBaseSchemaId);
}


/**
    Заменят в схеме все вхождения идентификаторов других схем соответствующими схемами
    и возвращает полученое значение

    @param schemaPath путь до схем
    @param schemaString строковое представление схемы
    @param schemaObject объектное представление схемы
    @return строковое значение схемы, в котором произведены все нужные замены
*/
var buildSchema = function(schemaPath, schemaString, schemaObject)
{
    //регулярка, которая ищет поля схемы, ссылающиеся на другую схему
    var regExp = /\{\s*"\$ref"\s*:[^\}]*\}/;
    while (regExp.test(schemaString))
    {
        var refLine = regExp.exec(schemaString).toString();
        var schemaKey = refLine.split(":")[1];
        //удаляем лишние символы
        schemaKey = schemaKey.replace(/"/g, "").replace(/\s/g, "").replace("}", "");
        var localSchemaObject = getSchemaObject(schemaPath, schemaKey, schemaObject);
        var localSchemaString = JSON.stringify(localSchemaObject);
        var baseSchema = getBaseSchemaByRef(schemaPath, schemaKey, schemaObject);

        localSchemaString = buildSchema(schemaPath, localSchemaString, baseSchema);

        schemaString = schemaString.replace(regExp, localSchemaString);
    }
    return schemaString;
};
exports.buildSchema = buildSchema;

/**
 Рекурсивно ищет поля с локалями в заданной схеме

 @param schemaObject объект схемы
 @param propertyStack накапливающийся в ходе рекурсии стек полей схемы

 @return [property1, property2, ...]
*/
var getLocalePropertiesInSchema = function(schemaObject, propertyStack)
{
    var result = [];
    if (typeof(schemaObject) == "object")
    {
        if (schemaObject.hasOwnProperty("localized") && schemaObject.localized === true)
        {
            result.push(propertyStack);
            //console.log("property stack : " + JSON.stringify(propertyStack));
        }
        for (var key in schemaObject)
        {
            if (key == "definitions") { continue; }
            var resultArray = getLocalePropertiesInSchema(schemaObject[key], propertyStack.concat([key]));
            result = result.concat(resultArray);
        }
    }
    return result;
};

/**
    Добавляем поля локалей, которые не описаны в схемах
    @param propertyList полный список локализованных полей всех схем
*/
var addHackedLocaleProperties = function(propertyList)
{
    var addHackedPropertyList;
    hackPropertyStackList = [
        ["complete", "effects", "items", "show_window", "items", "window_params", "description"],
        ["complete", "effects", "items", "show_window", "items", "window_params", "title"],
        ["start", "effects", "items", "show_window", "items", "window_params", "sequence", "items", "text"],
        ["complete", "effects", "items", "show_window", "items", "window_params", "sequence", "items", "text"],
        ["complete", "effects", "items", "show_window", "items", "window_params", "text"]
    ];
    propertyList["quest"] = propertyList["quest"].concat(hackPropertyStackList);

    hackPropertyStackList = [
        ["steps", "patternProperties", "^_\\d+$", "items", "tutor_hint", "window_params", "description"],
        ["steps", "patternProperties", "^_\\d+$", "items", "show_window", "items", "window_params", "description"],
        ["steps", "patternProperties", "^_\\d+$", "items", "show_window", "items", "window_params", "title"],
        ["steps", "patternProperties", "^_\\d+$", "items", "show_window", "items", "window_params", "text"],
        ["steps", "patternProperties", "^_\\d+$", "items", "show_window", "items", "window_params", "sequence", "items", "text"]
    ];

    if (!propertyList.hasOwnProperty("scenario"))
    {
        propertyList.scenario = [];
    }
    propertyList["scenario"] = propertyList["scenario"].concat(hackPropertyStackList);

    propertyList["base#/definitions/empty"] = [["description"], ["name"]];
}

/**
 Рекурсивно просматривает схемы в каталоге и отбирает поля с содержанием локали
 @param dirPath путь к папке с схемами
 @return {schemaId: [property1, property2, ...], ...}
*/
var findLocalePropertiesReq = function(schemaPath, dirPath)
{
    var result = {};
    var fileList = fs.readdirSync(dirPath);
    for (var i = 0; i < fileList.length; ++i)
    {
        var fileName = fileList[i];
        if (fileName.indexOf("_") == 0)
            continue;

        var fileStat = fs.statSync(path.join(dirPath, fileName));
        if (fileStat.isDirectory())
        {
            var newResult = findLocalePropertiesReq(schemaPath, path.join(dirPath, fileName));
            for (var key in newResult)
            {
                if (result.hasOwnProperty(key))
                {
                    console.log("wooops, something worng. key : " + key + ", result : " + JSON.stringify(result) + ", file name : " + fileName);
                }
                result[key] = newResult[key];
            }
        }
        else if (fileName.indexOf(".") != 0 && fileName.split('.')[1] == "json")
        {
                var fileContent = fs.readFileSync(path.join(dirPath, fileName));

                fileContent = buildSchema(schemaPath, fileContent.toString(), JSON.parse( fileContent ));

                try
                {
                    var schemaObject = JSON.parse( fileContent );
                }
                catch(error)
                {
                    console.log("file content : " + fileContent);
                    throw new Error("cant parse");
                }

                var propertyList = getLocalePropertiesInSchema(schemaObject, []);
                if (propertyList.length > 0)
                {
                    result[schemaObject.id] = propertyList;

                }
        }
    }

    return result;
};

/**
    Удаляет лишние элементы вроде properties, patternProperties, allOf
    @note Ненавижу этот метод!
*/
var cleanLocalePropertyList = function(propertyList, patternProperties)
{
    //console.log("try to clean property list : " + JSON.stringify(propertyList));
    for (var i = 0; i < propertyList.length; ++i)
    {

        //TODO все эти замены очень плохо! нужно сделать нормально!
        //allOf
        if (propertyList[i] == "allOf")
        {
            if (propertyList.length < i+2 || !/^\d+$/.test(propertyList[i+1]))
            {
                console.log("ERROR! не валидный список пропертей в месте allOf. " + JSON.stringify(propertyList));
            }
            propertyList[i+1] = "@removed";
        }
        //patternProperties
        if (propertyList[i] == "patternProperties")
        {
            var patternProperty = extractAndSavePatternProperty(propertyList, i+1, patternProperties);
            //console.log("extracted pattern property : " + patternProperty);
        }

        //array items
        if (propertyList[i] == "items")
        {
            propertyList[i] = "^\\d+$";
            var patternProperty = extractAndSavePatternProperty(propertyList, i, patternProperties);
        }

        if (propertyList[i] == "additionalProperties")
        {
            propertyList[i] = ".*";
            var patternProperty = extractAndSavePatternProperty(propertyList, i, patternProperties);
        }

        //TODO ОЧЕНЬ ПЛОХО!
        propertyList[i] = propertyList[i].replace(/properties|patternProperties|allOf|items/, "@removed");
    }
    var result = propertyList.filter(function(item, index, arr)
    {
        return item != "@removed";
    });

    return result;
}

/**
    Вызывает cleanLocalePropertyList для каждой схемы
    @param localePropertyObject полный список всех полей локалей всех схем
    @param patternProperties массив, в который сохраняются все паттен поля.
                            интересен только как возвращаемое значение
*/
var cleanFullLocaleObject = function(localePropertyObject, patternProperties)
{
    for (var key in localePropertyObject)
    {
        localePropertyObject[key] = localePropertyObject[key].map(function(item, index, arr)
        {
            return cleanLocalePropertyList(item, patternProperties);
        });
    }
}

/**
    Находит все поля локалей в схемах.
    Возвращает эти поля и список паттерн полей среди них

    @param schemaPath путь к файлам схем
    @return объект вида {properties: Value, patternProperties: Value}
*/
exports.findLocaleProperties = function(schemaPath)
{
    var localeProperties = findLocalePropertiesReq(schemaPath, schemaPath);
    addHackedLocaleProperties(localeProperties);
    var patternProperties = [];
    cleanFullLocaleObject(localeProperties, patternProperties);
    return {properties : localeProperties, patternProperties: patternProperties};
}
