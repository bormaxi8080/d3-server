/**
 * Класс для поиска подбуфера в буфере
 * @params search - буфер, который ищем
 */
var BufferSearch = function(search) {
    var _self = this;
    this.symbols = null;
    this.search = null;
    this.search_len = 0;

    this.setSearch(search);
};

BufferSearch.prototype.setSearch = function(search) {
    if (!Buffer.isBuffer(search)) {
        this.search = Buffer(search);
    } else {
        this.search = search;
    }

    this.search_len = search.length;
    this.prepareSymbols();
};

BufferSearch.prototype.prepareSymbols = function() {
    this.symbols = {};
    var i, c;
    for (i = 0; i < this.search_len; i++) {
        c = this.search[i];
        if (c in this.symbols) {
            this.symbols[c].push(i);
        } else {
            this.symbols[c] = [i];
        }
    }
};


/**
 * Оптимизированый поиск первого вхождения "подбуфера" в буфере.
 *
 * @param buff - Required. Буфер в котором ищем.
 * @param offset - Optional. Стартовая позиция для поиска. По умолчанию buff.length
 */
BufferSearch.prototype.indexOf = function (buff, offset) {
    if (offset == undefined) offset = 0;

    var buff_len    = buff.length;
    var i, j, k, shift, is_found, pos;

    i = offset;
    is_found = 0;
    pos = -1;
    while (i < buff_len) {
        // Если символа нет в подстроке, то сдвигаем и continue;
        if (!(buff[i] in this.symbols)) {
            i += this.search_len;
            continue;
        }

        for (j in this.symbols[buff[i]]) {
            shift = this.symbols[buff[i]][j];

            if ((i - shift) < offset) continue;

            is_found = 1;
            for (k = 0; k < this.search_len; k++) {
                if (buff[i - shift + k] != this.search[k]) {
                    is_found = 0;
                    break;
                }
            }
            if (is_found) {
                pos = i - shift;
                break;
            }
        }

        if (is_found) {
            pos = i - shift;
            break;
        } else {
            i += this.search_len;
        }
    }
    return pos;
};

/**
 * Простой поиск последнего вхождления "подбуфера" в буфере.
 *
 * @param buff - Required. Буфер в котором ищем.
 * @param search - Required. Буфер, который ищем
 * @param offset - Optional. Стартовая позиция для поиска. По умолчанию buff.length
*/
BufferSearch.prototype.lastIndexOfSimple = function(buff, search, offset) {
    if (offset == undefined) offset = buff.length;

    if (!Buffer.isBuffer(search)) {
        search = Buffer(search);
    }

    var i, j;
    var result = -1;
    var buff_len = buff.length;
    var search_len = search.length;

    for (i = offset; i >= 0; i--) {
        if (buff[i] == search[0]) {
            result = i;
            for (j = 0; j < search_len; j++) { // TODO оптимизировать для отсутствия двойной проверки.
                if ((buff_len <= (i+j)) || (buff[i+j] != search[j])) {
                    result = -1;
                    break;
                }
            }
            if (result > -1) break;
        }
    }
    return result;
};

/**
 * Простой поиск первого вхождления "подбуфера" в буфере.
 *
 * @param buff - Required. Буфер в котором ищем.
 * @param search - Required. Буфер, который ищем
 * @param offset - Optional. Стартовая позиция для поиска. По умолчанию buff.length
 */
BufferSearch.prototype.indexOfSimple = function(buff, search, offset) {
    if (!Buffer.isBuffer(search)) {
        search = Buffer(search);
    }

    if (offset == undefined) offset = 0;
    var i, j;
    var result = -1;
    var buff_len = buff.length;
    var search_len = search.length;

    for (i = offset; i < buff_len; i++) {
        if (buff[i] == search[0]) {
            result = i;
            for (j = 0; j < search_len; j++) { // TODO оптимизировать для отсутствия двойной проверки.
                if ((buff_len <= (i+j)) || (buff[i+j] != search[j])) {
                    result = -1;
                    break;
                }
            }
            if (result > -1) break;
        }
    }
    return result;
};

module.exports = BufferSearch;