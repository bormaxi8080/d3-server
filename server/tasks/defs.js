var fs = require('fs');
var taskUtil = require('./utils.js');
var report = require("../lib/utils/CIReports")(taskUtil.isCi());

var DEF_PATH = fs.realpathSync(__dirname + '/../../js/defs');
var CUSTOM_MIGRATION_PATH = DEF_PATH + '/migration/custom';
var PERMANENT_MIGRATIONS = DEF_PATH + '/migration/permanent';

var TEST_PATH = DEF_PATH + '/test';
var ASSET_PATH = fs.realpathSync(__dirname + '/../../static/assets');
var METASCHEMA_PATH = fs.realpathSync(__dirname + '/../lib/jsonschema.json');

var locale;
var context;

var failedDefs = [];
var utils;

namespace('defs', function ()
{
    desc('Накатить изменения');
    task('migrate', [], function()
    {
        console.log("start migrate defs..");
        var migrationPath = (arguments.length > 0) ? CUSTOM_MIGRATION_PATH : PERMANENT_MIGRATIONS;
        var executors = collectExecutors({path: migrationPath, allowedExecutors: arguments.length ? arguments : null});
        utils = require("../lib/utils/DefUtils")();

        if (executors.length > 0)
            process(migrateExecutor, endProcession, true);
        else
            console.log(taskUtil.red + 'nothing to execute' + taskUtil.red);

        /**
         * Колбэк процессора вызываемый на каждом дефе
         * @param root
         * @param name
         * @param def
         */
        function migrateExecutor(root, name, def, source)
        {
            for (var i = 0; i < executors.length; i++)
            {
                var executor = executors[i].executor;
                if (executor.can_exec(root, name, def, source))
                {
                    console.log(taskUtil.reset + 'apply patch: ' + executors[i].executor_name + ' to: ' + root + '/' + name);
                    var result = executor.execute(root, name, def);
                    processMigrationResult(result, root, name, def)
                }
            }
        }

        /**
         * Обработать результат миграции
         * @param result результат миграции - хэш типа {action:'<необходимое действие>'}.
         * Поддерживаются действия сохранения дефа: {action:'save'} и удаления: {action:'delete'}.
         * @param root путь до дефа
         * @param name имя дефа
         * @param def измененный миграцией объект дефа
         */
        function processMigrationResult(result, root, name, def)
        {
            var path = root + '/' + name;
            if (result.action == 'save')
            {
                var defStr = JSON.stringify(def, null, 4);
                fs.writeFileSync(path, defStr);
                console.log(taskUtil.green + 'save def: ' + root + '/' + name + taskUtil.green);
            }
            else if (result.action == 'delete')
            {
                console.log(taskUtil.green + 'delete def: ' + root + '/' + name + taskUtil.green);
            }
            else if (result.action == "skip")
            {
                console.log(taskUtil.green + "skipping def: " + root + "/" + name + taskUtil.green);
            }
            else
            {
                failedDefs.push({path: path, reason: 'Undefined action: ' + result.action});
            }
        }

        /**
         * Фильтровать миграции по списку из входных параметров
         * @param allowedExecutors
         */
        function filterExecutors(allowedExecutors)
        {
            var filtered = [];
            for (var i = 0; i < executors.length; i++)
            {
                for (var key in allowedExecutors)
                    if (executors[i].executor_name == allowedExecutors[key])
                        filtered.push(executors[i]);
            }
            return filtered;
        }
    }, true);

    function log(color, message)
    {
        if (color == null)
            color = taskUtil.reset;

        var args = [color, message];
        for (var i = 2; i < arguments.length; i++)
            args.push(arguments[i]);

        args.push(taskUtil.reset);

        console.log.apply(console, args);
    }

    desc("Проверить дефы на соответствие схемам");
    task("validate", function() {
        var tv4 = require("../lib/tv4.js").tv4;
        var pathModule = require("path");
        var walk = require("walk");
        var utils = require("../lib/utils/DefUtils")();

        log(taskUtil.green, "Loading schemas");

        function preprocessDef(def)
        {
            var constants = def.constants || {};

            function deep(obj)
            {
                for (var prop in obj)
                {
                    var value = obj[prop];
                    if (typeof value == "string" && value.indexOf("constant:") == 0)
                    {
                        var constant = value.split("constant:")[1];
                        if (constant in constants)
                            obj[prop] = constants[constant];
                        else
                            throw new Error("Constant " + constant + " is not defined");
                    }
                    else if (typeof value == "object")
                    {
                        deep(value);
                    }
                }
            }
            deep(def);
        };

        var metaSchema = JSON.parse(fs.readFileSync(METASCHEMA_PATH));
        var externalSchemas = JSON.parse(fs.readFileSync(pathModule.join(DEF_PATH, "schema", "_external_schemas.json")));

        var walker = walk.walk(pathModule.join(DEF_PATH, "schema"), {followLinks: false});
        var schemasWithDefault = [];
        walker.on("file", function(root ,stat, next) {
            if (!endWith(stat.name, ".json"))
                return next();

            var path = pathModule.join(root, stat.name);
            try
            {
                var schemaData = JSON.parse(fs.readFileSync(path));
                if (!tv4.validate(schemaData, metaSchema))
                    throw new Error(JSON.stringify(tv4.error));
            }
            catch (e)
            {
                log(taskUtil.red, "Error while parsing schema " + path + ": " + e.toString());
                return fail();
            }

            tv4.addSchema(schemaData.id, schemaData);

            if (schemaData.default)
                schemasWithDefault.push(schemaData.id);

            next();
        });

        walker.on("end", function() {
            log(taskUtil.green, "Validating schemas' default values");

            var error = false;
            for (var j in schemasWithDefault)
            {
                var schemaId = schemasWithDefault[j];
                var schema = tv4.getSchema(schemaId);

                var valid = tv4.validate(schema.default, schema);

                if (tv4.missing.length > 0)
                {
                    for (var i in tv4.missing)
                        log(taskUtil.red, "Missing schema for", schemaId, ":", tv4.missing[i]);
                    error = true;
                }
                if (!valid)
                {
                    log(taskUtil.red, "Validation failed for", schemaId, ":", tv4.error);
                    error = true;
                }
            }

            if (error)
                return fail();

            log(taskUtil.green, "Validating defs");

            var walker = walk.walk(DEF_PATH, {followLinks: false});

            var EXCLUDED_DIRS = ["test", "migration", "schema", "schema/services", "mapeditor",
                                 "localization/def", "localization/gui", "localization"];

            walker.on('file', function(root, stat, next)
            {
                // нас интересуют только JSON-файлы дефов
                if (stat.name == "version.json" || !endWith(stat.name, '.json'))
                    return next();

                // нас не интересуют некоторые подпапки, т.к. там не дефы, а вспомогательная хрень
                for (var i in EXCLUDED_DIRS)
                {
                    if (endWith(root, EXCLUDED_DIRS[i]))
                        return next();
                }

                var path = root + '/' + stat.name;
                try
                {
                    var def = JSON.parse(fs.readFileSync(path));
                }
                catch (e)
                {
                    log(taskUtil.red, "Error while parsing definition " + path + ": " + e.toString());
                    return complete();
                }

                var schemaId = def.schema_id;

                if (schemaId == null)
                    schemaId = externalSchemas[stat.name];

                if (schemaId == null)
                {
                    log(taskUtil.red, "No schema defined for", path);
                    error = true;
                    return next();
                }

                preprocessDef(def);

                var valid = tv4.validate(def, schemaId);
                if (tv4.missing.length > 0)
                {
                    for (var i in tv4.missing)
                        log(taskUtil.red, "Missing schema in", path, ":", tv4.missing[i]);
                    error = true;
                    return next();
                }

                if (!valid)
                {
                    log(taskUtil.red, "Validation failed for", path, tv4.error);
                    error = true;
                    return next();
                }

                next();
            });

            walker.on('end', function()
            {
                if (error)
                    fail();
                else
                    complete();
            });
        });

    }, true);


    desc('Запустить тэсты на дефы');
    task('test', ["build:combine_js_for_server"], function()
    {
        var LOCALE_PATH = fs.realpathSync(__dirname + '/../../../client/src/enchanted/localization/locale.js');
        eval(fs.readFileSync(LOCALE_PATH) + " locale = getData();");

        var ALL_JS_PATH = fs.realpathSync(__dirname + '/../../../server/tmp/build/serverContext.js');
        eval(fs.readFileSync(ALL_JS_PATH) + " context = createContext();");

        var args = {path: TEST_PATH, allowedExecutors: arguments.length ? arguments : null};

        report.startTestSuit("DEFS TESTS");
        collectManifests(ASSET_PATH, function(manifest)
        {
            utils = require("../lib/utils/DefUtils")(locale, context, manifest);
            var executors = collectExecutors(args);
            process(testExecutor, endProcession, false);

            function testExecutor(root, name, def, source)
            {
                for (var i = 0; i < executors.length; i++)
                {
                    var executor = executors[i].executor;
                    var executor_name = executors[i].executor_name;
                    if (executor.can_exec(root, name, def, source))
                    {
                        var defName = name.split(".json")[0];
                        try
                        {   //заменим константы значениями
                            var filledConstsDef = utils.replace_constants(JSON.parse(source));

                            var result = executor.execute(root, defName, filledConstsDef);
                            if (result)
                            {
                                if (!("reason" in result))
                                    throw new Error("Тест " + executor_name + " вернул ошибку в кривом формате: " + result);
                                result.path = root + '/' + name;
                                failedDefs.push(result);
                            }
                        }
                        catch(e)
                        {
                            if (e instanceof Error)
                                failedDefs.push({path: root + '/' + name, reason: "Необработанное RTE в тесте " + executor_name + ": " + e.stack});
                            else
                            {
                                e.path = root + '/' + name;
                                failedDefs.push(e);
                            }
                        }
                    };
                }
            }
        });
    }, true);

    var levelAcceptables;
    var levelCompleteds;
    var parsedQuests;
    var quests;
    var MAX_LVL = 20;


    desc('Построить граф квестов по уровням');
    task('levels_graph', ["build:combine_js_for_server"], function()
    {
        var ALL_JS_PATH = fs.realpathSync(__dirname + '/../../../server/tmp/build/serverContext.js');
        eval(fs.readFileSync(ALL_JS_PATH) + " context = createContext();");

        levelAcceptables = {};
        levelCompleteds = {};
        parsedQuests = [];
        for (var i = 0; i <= MAX_LVL; i++)
        {
            levelAcceptables[i] = [];
            levelCompleteds[i] = [];
        }

        quests = context.defs.list_defs("quests");

        parseQuest("quest_start_1", 1);

        for (var i = 0; i < quests.length; i++)
        {
            if (parsedQuests.indexOf(quests[i]) == -1)
            {
                console.log("Необработанный квест " + quests[i]);
            }
        }

        var result = "digraph G{ ";

        for (var i = 0; i <= MAX_LVL; i++)
        {
            for (var j = 0; j < levelAcceptables[i].length; j++)
            {
                result += "\"Доступные уровень " + i.toString() + "\"->" + levelAcceptables[i][j] + ";\n";
            }
            result += "\n\n\n\n";

            for (var j = 0; j < levelCompleteds[i].length; j++)
            {
                result += "\"Пройденные уровень " + i.toString() + "\"->" + levelCompleteds[i][j] + ";\n";
            }
            result += "\n\n\n\n";
        }

        result += "}";
        fs.open("levels_graph.gv", "w", null);
        fs.appendFile("levels_graph.gv", result, null, null);

        var levelAcceptablesStr = JSON.stringify(levelAcceptables, null, 4);

        fs.open("levelAcceptables.json", "w", null);
        fs.appendFile("levelAcceptables.json", levelAcceptablesStr, null, null);

        var levelCompletedsStr = JSON.stringify(levelCompleteds, null, 4);

        fs.open("levelCompleteds.json", "w", null);
        fs.appendFile("levelCompleteds.json", levelCompletedsStr, null, null);

    }, true);

    function parseQuest(questName, parentLevel, needAccept)
    {
        if (parsedQuests.indexOf(questName) != -1)
        {
            console.log("Уже обработанный квест " + questName);
            return;
        }

        var quest = context.defs.get_def("quests." + questName);

        if (quest == null)
        {
            console.log("Не найден квест " + questName);
            return;
        }

        var level = parentLevel;

        parsedQuests.push(questName);

        if ("start" in quest && "conditions" in quest.start)
        {
            for (key in quest.start.conditions)
            {
                var condition = quest.start.conditions[key];
                if ("params" in condition && "type_id" in condition.params && condition.params.type_id == "level")
                {
                    level = condition.count;
                    break;
                }
            }
        }

        var accepted = false;

        level = Math.max(level, parentLevel);

        if (needAccept || level > parentLevel)
        {
            accepted = true;
            levelAcceptables[level].push(questName);
        }

        var fromLevel = accepted ? level + 1 : level;

        if (fromLevel <= MAX_LVL)
            levelCompleteds[fromLevel].push(questName);

        if ("complete" in quest && "effects" in quest.complete)
            recursiveParseEffects(quest.complete.effects, questName, level, false);

        if ("start" in quest && "effects" in quest.start)
            recursiveParseEffects(quest.start.effects, questName, level, accepted);

        if ("fail" in quest && "effects" in quest.fail)
            recursiveParseEffects(quest.fail.effects, questName, level, false);
    }

    function recursiveParseEffects(effects, quest, parentLevel, needAccept)
    {
        if (!effects) return "";

        for (var j = 0; j < effects.length; j++)
        {
            var effect = effects[j];
            if ("give_access" in effect)
            {
                for (var k = 0; k < effect.give_access.length; k++)
                {
                    parseQuest(effect.give_access[k], parentLevel, needAccept);
                }
            }
        }
    }

    desc('Построить граф квестов');
    task('quests_graph', ["build:combine_js_for_server"], function()
    {
        var LOCALE_PATH = fs.realpathSync(__dirname + '/../../../client/src/enchanted/localization/locale.js');
        eval(fs.readFileSync(LOCALE_PATH) + " locale = getData();");

        var ALL_JS_PATH = fs.realpathSync(__dirname + '/../../../server/tmp/build/serverContext.js');
        eval(fs.readFileSync(ALL_JS_PATH) + " context = createContext();");

        var quests = context.defs.list_defs("quests");
        var result = "digraph G{";

        var needFullDescription = false;
        if (arguments.length && arguments[0] == "full")
            needFullDescription = true;
        // идем по всем квестам и запоминаем те, где дается доступ к текущему
        for (var i = 0; i < quests.length; i++)
        {
            var quest = context.defs.get_def("quests." + quests[i]);
            if ("complete" in quest && "effects" in quest.complete)
                result += parseEffects(quest.complete.effects, quests[i], needFullDescription);

            if ("start" in quest && "effects" in quest.start)
                result += parseEffects(quest.start.effects, quests[i], needFullDescription);

            if ("fail" in quest && "effects" in quest.fail)
                result += parseEffects(quest.fail.effects, quests[i], needFullDescription);
        }

        for (var level = 3; level <= 25; level++)
        {
            for (var i = 0; i < quests.length; i++)
            {
                var quest = context.defs.get_def("quests." + quests[i]);
                if ("start" in quest && "conditions" in quest.start)
                {
                    for (key in quest.start.conditions)
                    {
                        var condition = quest.start.conditions[key];
                        if ("params" in condition && "type_id" in condition.params && condition.params.type_id == "level" && condition.count == level)
                            result += "\"Уровень " + level.toString() + "\"->" + questToString(quests[i], needFullDescription) + ";\n";
                    }
                }
            }
        }

        result += "}";
        fs.open("quests_graph.gv", "w", null);
        fs.appendFile("quests_graph.gv", result, null, null);
    }, true);

    function parseEffects(effects, quest, needFullDescription)
    {
        if (!effects) return "";
        var result = "";

        for (var j = 0; j < effects.length; j++)
        {
            var effect = effects[j];
            if ("give_access" in effect)
            {
                for (var k = 0; k < effect.give_access.length; k++)
                {
                    result += questToString(quest, needFullDescription) + "->" + questToString(effect.give_access[k], needFullDescription) + ";\n";
                }
            }
        }

        return result;
    }

    function parseConditions(conditions)
    {
        var result = "";
        for (key in conditions)
        {
            var condition = conditions[key];
            if ("type" in condition)
                result += condition.type + "; ";
            if ("count" in condition)
                result += condition.count + "; ";
            if ("params" in condition && "type_id" in condition.params)
                result += condition.params.type_id;
            result += "\n";
        }

        return result;
    }

    desc('Вывести список квестов в которых можно попросить ресурсы');
    task('quests_with_resource_request', ["build:combine_js_for_server"], function()
    {
        var ALL_JS_PATH = fs.realpathSync(__dirname + '/../../../server/tmp/build/serverContext.js');
        eval(fs.readFileSync(ALL_JS_PATH) + " context = createContext();");

        var quests = context.defs.list_defs("quests");
        var resources = context.defs.list_defs("resources");

        var requestables = [];
        for (var i = 0; i < resources.length; i++)
        {
            var resource = context.defs.get_def("resources." + resources[i]);
            if (resource.requestable == true)
            {
                requestables.push(resources[i]);
            }
        }

        var questsWithResourceRequest = [];
        for (var i = 0; i < quests.length; i++)
        {
            var conditions = context.defs.get_def("quests." + quests[i] + ".complete.conditions");

            for (key in conditions)
            {
                var condition = conditions[key];
                if ("params" in condition && "type_id" in condition.params && requestables.indexOf(condition.params.type_id) != -1
                                    && questsWithResourceRequest.indexOf(quests[i]) == -1)
                {
                    questsWithResourceRequest.push(quests[i]);
                }
            }
        }

        console.log(questsWithResourceRequest);
    }, true);

    function questToString(questName, needFullDescription)
    {
        var quest = context.defs.get_def("quests." + questName);
        if (quest == null) return "\"ВНИМАНИЕ!!!! ссылка не несуществуюший квест "  + questName + "\"";
        var result = "\"" + questName +  "\n " + locale[quest.view.title] + "\n" + quest.view.line;
        if (needFullDescription)
        {

            if ("start" in quest && "conditions" in quest.start)
            {
                result += "\n\n start: ";
                result += parseConditions(quest.start.conditions);
            }
            if ("complete" in quest && "conditions" in quest.complete)
            {
                result += "\n complete: ";
                result += parseConditions(quest.complete.conditions);
            }
            if ("complete" in quest && "effects" in quest.complete)
            {
                result += "\n rewards: ";
                for (key in quest.complete.effects)
                {
                    var effect = quest.complete.effects[key];
                    if ("drop" in effect)
                        result += parseDrop(effect.drop);
                }

            }

        }
        result += "\"";
        return result;
    }

    function parseDrop(drop)
    {
        var result = "";
        for (key in drop.ranges)
        {
            var item = drop.ranges[key];
            result += item.reward.type_id;
            result += ": " + item.reward.min_amount;
            result += ";  ";
        }

        return result;
    }

    /**
     * Функция завершающая обработку дефов
     */
    function endProcession()
    {
        if (failedDefs.length > 0)
        {
            var failedDefsHash = {WARNS:{_count:0},ERRORS:{_count:0}};
            var failHash;

            //для каждого зафейленного дефа
            for (var i = 0; i < failedDefs.length; i++)
            {
                //инфа о фейле
                var failInfo = failedDefs[i];

                //в зависимости от типа фейла выбираем хеш, в который засунем инфу о фейле
                if(failInfo.type == "warn")
                    failHash = failedDefsHash.WARNS;
                else
                    failHash = failedDefsHash.ERRORS;

                failHash._count++;

                //создаем в хеше массив для фейлов группы, к которой принадлежит текущий фейл, если он еще не создан

                var group = (failInfo.group) ? failInfo.group : "OTHER";

                if(failHash[group] == undefined)
                    failHash[group] = [];

                //заносим информацию о фейле
                failHash[group].push(failInfo);
            }

            //для каждого типа фейла (ерроры, варнинги)
            for (var failTypeName in failedDefsHash)
            {
                //пейчатаем заголовок для пачки фейлов данного типа
                report.startTestSuit(failTypeName);

                failHash = failedDefsHash[failTypeName];

                //выводим количество фейлов данного типа
                report.log("[total " + failHash._count + "]");

                try {
                    for (var failGroupName in failHash) {

                        //свойства, которые начинаются с подчеркивания, не считаем группами тестов
                        if(failGroupName.indexOf('_') == 0) continue;

                        var failGroup = failHash[failGroupName];

                        if(failGroup.length == 0) {
                            if (report.isCI){
                                // Делаем положительные отчет для CI. В противном случае просто не выводим эти строки
                                report.startTest(failGroupName);
                                report.finishTest();
                            }
                            continue;
                        }

                        report.startTest(failGroupName);

                        for (var i = 0; i < failGroup.length; i++)
                        {
                            var failInfo = failGroup[i];
                            failInfo.path = failInfo.path.split(DEF_PATH)[1];

                            if (failTypeName != "ERRORS") {
                                report.warningDefTestMessage(failInfo.path,failInfo.reason);
                            }
                            else
                            {
                                report.failDefTestMessage(failInfo.path,failInfo.reason);
                            }

                        }
                        report.finishTest();

                    }
                } catch (error){
                    if (failGroupName) report.finishTest();
                    report.startTest("TESTS CODE");
                    report.failTestMessage("Критическая ошибка. Проверьте код тестов",failInfo);
                    report.finishTest("TESTS CODE");
                }
                report.finishTestSuit();
            }
        }
        else
        {
            console.log(taskUtil.green + "no failed files" + taskUtil.green);
        }
        console.log(taskUtil.reset);
        complete();
    }


    /**
     * Начать обработку дефов
     * @param executor - обработчик запускаемый над каждым дефом
     * @param end - колбэк завершения обработки
     * @param showJSONParseError - выводить ошибки парсинга JSON'а
     */
    function process(executor, end, showJSONParseError)
    {
        var walk = require('walk');
        var walker = walk.walk(DEF_PATH, { followLinks: false });
        console.log("*******");

        walker.on('file', function(root, stat, next)
        {
            var path = root + '/' + stat.name;

            var isJson = endWith(stat.name, '.json');
            var isDef = !endWith(root, 'migration') && !endWith(root, 'test') && !endWith(root, 'schema');
            if (isJson && isDef)
            {
                try
                {
                    var data = fs.readFileSync(root + '/' + stat.name);
                    try
                    {
                        var def = JSON.parse(data);
                        try
                        {
                            executor(root, stat.name, def, data);
                        } catch (error)
                        {
                            console.log(taskUtil.red + 'cant execute with: ' + path + ', reason: ' + error + taskUtil.red);
                        }
                    } catch (error)
                    {
                        if (showJSONParseError) failedDefs.push({path: path, reason: ', can\'t parse JSON: ' + error});
                    }
                } catch (error)
                {
                    console.log(taskUtil.red + "can't read file: " + root + '/' + stat.name + "\n" + "reason: " + error + taskUtil.red);
                }
            }
            next();
        });

        walker.on('end', function()
        {
            end();
        });
    }

    /**
     * Собрать все запускаемые файлы (миграции или тэсты) в дирректории path.
     * @param args  объект с параметрами функции:
     * {
     *   path - директория с запускаемыми файлами,
     *   allowedExecutors - разрешенные к применению экзекуторы (опционально)
     * }
     */
    function collectExecutors(args)
    {
        var path = args.path;
        var allowedExecutors = args.allowedExecutors;
        var executors = [];

        if (allowedExecutors)
        {
            for (var key in allowedExecutors)
            {
                var customExecName = allowedExecutors[key];
                if (fs.existsSync(path + '/' + customExecName))
                {
                    addExecutor(path, customExecName);
                }
                else
                {
                    console.log(taskUtil.red + 'Can\'t find custom executor by path: ' + path + '/' + execName + taskUtil.red);
                }
            }
        }
        else
        {
            var dirInfo = fs.readdirSync(path);
            for (var i = 0; i < dirInfo.length; i++)
            {
                var execName = dirInfo[i];
                if (endWith(execName, '.js'))
                {
                    addExecutor(path, execName);
                }
            }
        }

        function addExecutor(path, name)
        {
            var fileName = path + '/' + name;
            console.log(taskUtil.green + 'add executor: ' + fileName + taskUtil.green);
            try
            {
                var executor = loadExecutor(path, name);
                executors.push({executor: executor, executor_name: name});
            } catch (e)
            {
                console.log(taskUtil.red + 'Can\'t load executor: ' + fileName + ', reason: ' + e + taskUtil.red);
            }
        }

        /**
         * Загрузить миграцию/тэст
         * @param root путь до миграции/тэста
         * @param name имя миграции/тэста
         * @return {can_exec: can_exec, execute: execute} - объект с миграцией/тэстом
         */
        function loadExecutor(root, name)
        {
            var execCode = fs.readFileSync(root + "/" + name);
            var executor;
            eval(execCode + ' executor = {can_exec: can_exec, execute: execute};');
            checkState(('can_exec' in executor), "Missed required function \"can_exec\"!");
            checkState(('execute' in executor), "Missed required function \"execute\"!");
            return executor;
        }

        return executors;
    }

    function checkState(statement, msg)
    {
        if (!statement) throw new Error(msg ? msg : "Invalid state!");
    }

    function checkNotNull(ref, msg)
    {
        if (!ref) throw new Error(msg ? msg : "Null pointer exception!");
        return ref;
    }

    function collectManifests(path, end)
    {
        var walk = require('walk');
        var executorWalker = walk.walk(path, { followLinks: false });
        var manifest;
        var retval = {};
        executorWalker.on('file', function(root, stat, next)
        {
            if (stat.name == "files.json")
            {
                var filename = root + '/' + stat.name;
                manifest = JSON.parse(fs.readFileSync(filename));
                for (var asset in manifest)
                {
                    var str = root + "/" + asset;
                    str = str.split(ASSET_PATH + "/")[1]
                    retval[str] = true;
                }
            }
            next();
        });
        executorWalker.on('end', function()
        {
            end(retval);
        });
    }

    function endWith(string, pattern)
    {
        var indexOf = string.indexOf(pattern);
        return (indexOf != -1) && (indexOf == string.length - pattern.length);
    }

    desc("Сортировка локали");
    task("sort_locale", [], function()
    {
        var defLocalePath = DEF_PATH + '/localization/localeRU.json';

        console.log(taskUtil.green + 'sorting locale def keys: ' + defLocalePath + taskUtil.reset);

        var sortLocaleFile = function(filePath)
        {
            var localeHash = fs.readFileSync(filePath);
            var localeArray = localeHash.toString().split("\n");
            localeArray.shift();
            localeArray.pop();

            localeArray.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });

            var str;
            for (var i in localeArray){
                str = localeArray[i];
                if (str.charAt(str.length-1) == '"') {
                    localeArray[i] = str + ",";
                }
            }

            str = localeArray[localeArray.length-1];
            if (str.charAt(str.length-1) == ',') {
                localeArray[localeArray.length-1] = str.substr(0,str.length-1)
            }

            localeArray.unshift("{");
            localeArray.push("}");
            fs.writeFileSync(filePath, localeArray.join("\n"));
        }

        sortLocaleFile(defLocalePath);
        complete();
    }, true);
})