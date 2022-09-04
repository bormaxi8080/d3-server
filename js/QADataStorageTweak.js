/**
 * Заглушка, используемая для ограничения доступа к
 * DataStorage на время работы handle
 *
 * @param   context Контекст. Нужен для ограничения записи в
 * DataStorage при выполнении handle
 */
var QADataStorageTweak = function (context) {

    this.get_count = function() {
        return counter
    }

    var _context = context;
    var _realStorage = null;
    var counter = 0;

    //для просмотра под дебаггером
    this.__data = _context.storage.__data;

    /**
     * Активировать ограничение на запись в DataStorage
     */
    this.enable = function() {
        counter++;
        if(counter == 1) {
            if(_realStorage) throw new Error('tweak уже включён.');
            _realStorage = _context.storage;
            _context.storage = this;
        }
    };

    /**
     * Деактивировать огранчение на запись в DataStorage
     */
    this.disable = function() {
        counter--;
        if (counter < 0) {
            counter = 0
            throw new Error('tweak не включён.');
        }

        if(counter == 0) {
            if(!_realStorage) throw new Error('tweak не включён.');
            _context.storage = _realStorage;
            _realStorage = null;
        }

        //TODO: раскомментировать методы enable и disable после того, как сервер перестанет делать странные вызовы у data storage
        //при вызове get_property
    };

    this.set_property = function(prop_name, new_value) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");
        throw new Error("Запись данных не должна производиться в данный момент!");
    };

    this.get_property = function(prop_name) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");

        return _realStorage.get_property(prop_name);
    };

    this.get_property_or_default = function(prop_name, value) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");

        return _realStorage.get_property_or_default(prop_name, value);
    };

    this.inc_property = function(name, inc) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");
        throw new Error("Запись данных не должна производиться в данный момент!");
    };

    this.has_property = function(prop_name) {
        if (!_realStorage) throw new Error("Ограничение доступа к DataStorage не активно!");

        return _realStorage.has_property(prop_name);
    };

    this.getDump = function() {
        return _realStorage.getDump();
    }
};
