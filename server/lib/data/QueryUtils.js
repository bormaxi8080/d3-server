
/**
 * Преобразует объект записи из бд и обычный хэш
 *
 * @param row {Object} объект записи из БД
 * @return {Object}
 * @author Stanislav A. Namestnikov
 */
module.exports.flatRow = function(row) {
    var i, k;
    var ret = {};
    for (i in row['attributes']) {
        k = row['attributes'][i];
        ret[k] = row[k];
    }
    return ret;
};

/**
 * Собирает уникальный id записи из shard_id и id записи
 *
 * @param shard_id {String}
 * @param id {int}
 * @return {String}
 * @author Stanislav A. Namestnikov
 */
module.exports.combineFullId = function(shard_id, id) {
    return '' + shard_id + '|' + id;
};

/**
 * Парсит уникальный id записи на shard_id и id записи
 *
 * @param full_id {String}
 * @return {Array} [shard_id, id]
 * @author Stanislav A. Namestnikov
 */
module.exports.splitFullId = function(full_id) {
    // TODO проверка на ошибки
    return full_id.split('|');
};

module.exports.Wrapper = function(func){
    return function(mgr) {
        var _self = this;
        this.manager = mgr;
        _self.result = null;
        _self.error = null;

        this.run = function() {
            func.apply(this, arguments)
                .success(function(data){
                    _self.result = data;
                    _self.emit('complete');
                })
                .error(function(error){
                    _self.error = error;
                    _self.emit('error');
                });
        };
    };
};

module.exports.getCacheID = function(prefix, network_id, social_id) {
    return prefix + "_" + network_id + "_" + social_id;
};

