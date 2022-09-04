module.exports = function(locale, context, assets)
{
    //функция прохождения по дефу с тестами
    //def - собственно деф
    //path - массив из путей по объекту вида key1.key2.*.key4.keyN к искомым значениям (возможно использование звездочек)
    //handler - функция проверки которая будет вызывана для найденных по путям значений
    //name - имя текущего дефа
    this.go_through = function(def, path, handler, name)
    {
        var opened = this.open_stars(def, this.to_hash(path));
        for (var i = 0; i < opened.length; i++)
        {
            var obj = this.find(def, opened[i]);
            var res;
            if (obj)
                res = handler(obj, name);
            if (res)
            {
                return res;
            }
        }
    };

    this.open_stars = function(def, props_hash)
    {
        var retval = [];
        for (var prop in props_hash)
        {
            var final_props = [];
            var arr = prop.split('*');
            var obj = def;
            var part_of_prop = arr[0];
            if (part_of_prop.charAt(part_of_prop.length - 1) == ".")
            {
                obj = find(obj, part_of_prop.substr(0, part_of_prop.length - 1));
                if (!obj) break;
                var sub_props_hash = {};
                for (var key in obj)
                {
                    sub_props_hash[part_of_prop + key + arr.slice(1).join('')] = true;
                }
                final_props = final_props.concat(open_stars(def, sub_props_hash));
            }
            else
            {
                final_props.push(part_of_prop);
            }

            retval = retval.concat(final_props);
        }
        return retval;
    };

    this.apply_drop_item = function(old_drop, new_drop)
    {
        if (!('ranges' in old_drop)) old_drop.ranges = [];
        var old_ranges = old_drop.ranges;
        if (new_drop.roll != old_drop.roll) utils.fixRoll(old_drop, new_drop.roll);

        for (var j = 0; j < new_drop.ranges.length; j++)
        {
            var new_range = new_drop.ranges[j];
            var isNeedToAdd = true;
            for (var i = 0; i < old_ranges.length; i++)
            {
                var old_range = old_ranges[i];
                if (old_range.reward.type_id == new_range.reward.type_id)
                {
                    old_range.min = new_range.min;
                    old_range.max = new_range.max;
                    old_range.reward.min_amount = new_range.reward.min_amount;
                    if (new_range.reward.max_amount)
                    {
                        old_range.reward.max_amount = new_range.reward.max_amount;
                    }
                    else
                    {
                        if ('max_amount' in old_range.reward) delete old_range.reward.max_amount;
                    }
                    isNeedToAdd = false;
                }
            }
            if (isNeedToAdd) old_ranges.push(new_range);
        }
    };

    this.to_hash = function(arr)
    {
        var retval = [];
        for (var i = 0; i < arr.length; i++)
        {
            retval[arr[i]] = true;
        }
        return retval;
    };

    this.find = function(obj, path)
    {
        var arr = path.split(".");
        for (var i = 0; i < arr.length; i++)
        {
            obj = obj[arr[i]];
            if (obj == undefined) return null;
        }
        return obj;
    }

    this.trace = function(obj)
    {
        console.log(obj);
    }

    this.check_state = function (state, msg)
    {
        if (!state)
        {
            this.error(msg ? msg : "Invalid state!", "STATE");
        }
    }

    //проверить наличие дефа в игре
    //type_id - идентификатор дефа
    //folders - папки в которых будет искаться деф (по дефолту все существующие папки)
    this.check_type_id = function(type_id, folders)
    {
        this.open_expressions(type_id, function(type_id)
        {
            if (!type_id || type_id == "castle")
                return null;
            folders = folders || ["fake_resources", "buffs", "clothes", "map_items", "potions", "resources", "quests", "scenario"];
            for (var i = 0; i < folders.length; i++)
            {
                var folder = folders[i];
                if (context.defs.has_def(folder + "." + type_id))
                    return null;
            }
            this.error(type_id + '"' + " not exists", "TYPE_ID");
        });
    };

    //проверить наличие ассета в манифестах
    this.check_asset = function(asset)
    {
        if (asset.indexOf("formula:") == 0) return;
        asset = asset.split("#")[0]; // отбрасываем обращение к символам внутри спрайтшита или swf
        if (!(asset in assets))
            this.error(asset + " not in manifests", "ASSETS");
    };

    //проверить, существует ли ключ в локализации
    this.check_locale = function(localeValue)
    {
        if (localeValue.indexOf('formula:' == 0)) { return; }

        var exists = false;
        for (var key in locale)
        {
            if (locale[key] == localeValue)
            {
                exists = true;
                break;
            }
        }
        if (!exists) this.error(key + '"' + " not exists in localization", "LOCALE");
    };

    //проверить массив эффектов
    //arr - собственно массив
    //name - имя текущего дефа
    this.check_effects = function(arr, name)
    {
        for (var i = 0; i < arr.length; i++)
        {
            var obj = arr[i];
            if ("drop" in obj)
            {
                this.check_drop(obj.drop);
            }
            if ("show_window" in obj)
            {
                this.check_window(obj.show_window, name);
            }
            if ("give_access" in obj)
            {
                this.check_give_access(obj.give_access, name);
            }
        }
    };

    //проверить объект дропа
    this.check_drop = function(obj)
    {
        if (!("roll" in obj))
        {
            this.error("Wrong roll: " + obj.roll, "DROP");
        }

        for (var i = 0; i < obj.ranges.length; i++)
        {
            var range = obj.ranges[i];

            if (range.min > obj.roll || range.max > obj.roll)
                this.error("Wrong drop interval in range " + i, "DROP");

            if (range.min > range.max)
                this.error("Wrong drop interval in range " + i, "DROP");

            if (range.reward.min_amount > range.reward.max_amount)
                this.error("Wrong drop interval in range " + i, "DROP");
            check_type_id(range.reward.type_id);
        }
    };

    this.apply_drop = function(typical_range, roll, effect)
    {
        // создаем drop в эффекте если нужно
        if (!('drop' in effect)) effect.drop = {};
        if (!('ranges' in effect.drop)) effect.drop.ranges = [];
        if (!('roll' in effect.drop)) effect.drop.roll = roll;

        var ranges = effect.drop.ranges;
        if (effect.drop.roll != roll) this.fixRoll(effect.drop, roll);
        var isNeedToAdd = true;
        for (var i = 0; i < ranges.length; i++)
        {
            var range = ranges[i];
            if (range.reward.type_id == typical_range.reward.type_id)
            {
                range.min = typical_range.min;
                range.max = typical_range.max;
                range.reward.min_amount = typical_range.reward.min_amount;
                if (typical_range.reward.max_amount)
                {
                    range.reward.max_amount = typical_range.reward.max_amount;
                }
                else
                {
                    if ('max_amount' in range.reward) delete typical_range.reward.max_amount;
                }
                isNeedToAdd = false;
            }
        }
        if (isNeedToAdd) ranges.push(typical_range);
    }

    this.clone_object = function(target)
    {
        return JSON.parse(JSON.stringify(target));
    };

    this.compare_objects = function(obj1, obj2)
    {
        return JSON.stringify(obj1) == JSON.stringify(obj2);
    };

    this.find_object = function(obj, array)
    {
        for (var i = 0; i < array.length; i++)
        {
            var arrObj = array[i];
            if (this.compare_objects(obj, arrObj)) return i;
        }
        return -1;
    }

    this.fixRoll = function(drop, new_roll)
    {
        for (var i = 0; i < drop.ranges.length; i++)
        {
            var range = drop.ranges[i];
            if ('min' in range)
                range.min = range.min == 0 ? 0 : get_new_value(range.min, drop.roll, new_roll);
            if ('max' in range)
                range.max = get_new_value(range.max, drop.roll, new_roll);
        }
        drop.roll = new_roll;

        function get_new_value(value, old_max, new_max)
        {
            return Math.round((value / old_max) * new_max);
        }
    }

    this.can_change_with_executor = function(path, name, def, executor)
    {
        var obj = this.clone_object(def);
        this.utils = this;
        executor.call(this, path, name, obj);
        return !this.compare_objects(def, obj);
    };

    //проверить массив show_window из окон
    //arr - собственно массив
    //name - имя текущего дефа
    this.check_window = function(arr, name)
    {
        //выдернуто регекспом из WindowMediatorFactory.as
        var availibleWindowNames = ["shop","sellConfirm","quest_description","quest_complete","quest_failed","speed_crop",
            "speed_pet","speed_rent","speed_craft","speed_resource","alert","choose_crop","craft_window",
            "neighbourhoodInvite","neighbourhoodHelp","switchRoom","npc_dialog","expand","supergloomwindow",
            "expand_info","inventory","inventorySell","storage_confirm","level_up","tutor_hint","build",
            "build_complete","customize_look","not_enough_energy","npc_quest","freeGifts","sendGift",
            "request_resource","npc_dialog_2","inbox","crew_hire","crew_hire_help","crewHireFriendSelect",
            "crew_apply","crew_show","insufficientRealAlert","bank","kingdom_name","colorize","help_bonus",
            "new_ally","ally_info","area_expanded"];

        for (var i = 0; i < arr.length; i++)
        {
            var obj = arr[i];
            if(availibleWindowNames.indexOf(obj.window_name) == -1)
            {
                this.error('Wrong window name: "' + obj.window_name + '"', "WINDOW");
            }

            if(obj.window_params == undefined)
            {
                this.error('Window params is undefined', "WINDOW");
            }

            if (obj.window_name == "quest_complete")
            {
                check_locale(obj.window_params.description);
                check_locale(obj.window_params.title);
                if (obj.window_params.quest_id != name)
                {
                    this.error('Wrong quest id in quest_complete window: ' + obj.window_params.quest_id, "WINDOW");
                }
            }
        }
    };

    //проверить массив give_access из квестов
    //arr - собственно массив
    //name - имя текущего квеста (который собственно дает доступ к другим)
    this.check_give_access = function(arr, name)
    {
        var quests = context.defs.list_defs("quests");
        var accessFromQuests = [];
        var def;
        // идем по всем квестам и запоминаем те, где дается доступ к текущему
        for (var i = 0; i < quests.length; i++)
        {
            var effects = context.defs.get_def("quests." + quests[i] + ".complete.effects");
            if (effects == null)
            {
                this.error("В квесте " + quests[i] + " нет complete.effects", "QUEST");
                return;
            }
            for (var j = 0; j < effects.length; j++)
            {
                var effect = effects[j];
                if ("give_access" in effect)
                {
                    if (effect.give_access.indexOf(name) != -1)
                    {
                        accessFromQuests.push(quests[i]);
                    }
                }
            }
        }

        // если доступ к квесту дается из более чем 1го места
        if (accessFromQuests.length > 1)
        {
            def = context.defs.get_def("quests." + name);
            // проверяем что в старт кондишенсах ждем выполнение всех кветос
            if ("start" in def && "conditions" in def.start)
            {
                var conditions = def.start.conditions;
                for (var key in conditions)
                {
                    var condition = conditions[key];
                    if (condition.name == "quest_complete" && "params" in condition && accessFromQuests.indexOf(condition.params.type_id) != -1)
                    {
                        accessFromQuests.splice(accessFromQuests.indexOf(condition.params.type_id), 1);
                    }
                }
            }
            // остались квесты из которых дается доступ, но их не ждем в старт кондишенсах
            if (accessFromQuests.length > 0)
            {
                this.error("Wrong give access - miss start conditions: " + name, "QUEST");
            }
        }

        for (var i = 0; i < arr.length; i++)
        {
            var obj = arr[i];
            if (obj == name)
            {
                this.error("Wrong give access - access to itself: " + obj, "QUEST");
            }
            this.check_type_id(obj, ["quests"]);
        }
    };

    this.replace_constants = function (def)
    {
        if ("constants" in def)
        {
            var constants = def.constants;

            function deep(obj)
            {
                for (var prop in obj)
                {
                    var value = obj[prop];
                    if (typeof value == "string")
                    {
                        if (value.indexOf("constant:") == 0)
                        {
                            var consName = value.split("constant:")[1];
                            if (consName in constants)
                            {
                                obj[prop] = constants[consName];
                            }
                            else
                            {
                                this.error("Constant '" + consName + "' is not defined", "CONSTANT");
                            }
                        }
                    }
                    else if (typeof value == "object")
                    {
                        deep(value);
                    }
                }
            }

            deep(def);
        }
        return def;
    };

    /**
     * Эта функция имеет цель помочь проверить значения, которые могут содержать expressions (те, что для квестов)
     * например в условии квеста указано "type_id": "$=decor_meteorite_3x3,decor_piece_of_meteorite_1x1"
     * данная функция правильно распарсит выражение и вызовет executor 2 раза с аргументом decor_meteorite_3x3
     * и decor_piece_of_meteorite_1x1 по очереди
     */
    this.open_expressions = function(valueWithExpressions, executor)
    {
        if(typeof valueWithExpressions == "string" && valueWithExpressions.length && valueWithExpressions.charAt(0) == "$")
        {
            var values = valueWithExpressions.substr(2).split(",");
            for (var i = 0; i < values.length; i++)
            {
                var value = values[i];
                executor(value);
            }
        }
        else
        {
            executor(valueWithExpressions);
        }
    };

    this.error = function (msg, type)
    {
        if (!type){
            throw {reason: msg, group: "OTHER"}
        }
        throw {reason: msg, group: type}
    }

    return this;
}