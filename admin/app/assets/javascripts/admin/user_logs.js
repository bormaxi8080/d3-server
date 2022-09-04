var bak_numb = '';
var bak_date = '';

var dt_add = function() {
    $('#offset').datetimepicker({
        dateFormat: "dd.mm.yy",
        timeFormat: 'HH:mm:ss',
        showSecond: true
    });
};

var dt_remove = function() {
    $('#offset').datetimepicker('destroy');
};

var labelsDate = function() {
    $('#offset_label').html('время последней записи:');
    $('#limit_label').html('количество секунд:');
};

var labelsNumb = function() {
    $('#offset_label').html('сдвиг от последней записи:');
    $('#limit_label').html('количество записей:');
};

var selectDate = function() {
    bak_numb = $('#offset').val();
    $('#offset').val(bak_date);
    labelsDate();
    dt_add();
};

var selectNumb = function() {
    bak_date = $('#offset').val();
    $('#offset').val(bak_numb);
    labelsNumb();
    dt_remove();
};

var getType = function() {
    return $('input[name=type]:checked', '#form').val();
};

var to_ts = function(value) {
    var d;
    var m = value.match(/(\d{2})\.(\d{2})\.(\d{4})\ (\d{2}):(\d{2}):(\d{2})/);
    if (m) {
        // var d = new Date(year, month, day, hours, minutes, seconds, milliseconds);
        d = new Date(m[3], m[2], m[1], m[4], m[5], m[6]);
        value = Math.round(+d/1000);
    }
    return value;
};

var from_ts = function(ts) {
    var d = new Date(ts * 1000);
    return $.format.date(d, 'dd.MM.yyyy HH:mm:ss')
};

$(document).ready(function() {
    if (getType() == 'date') {
        // по дате
        var ts = $('#offset').val();
        if (ts) {
            $('#offset').val(from_ts(ts));
        }
        labelsDate();
        dt_add();
    } else {
        // по числу
        labelsNumb();
    }

    // Вешаем обработчики событий
    $('#form').submit(onFormSubmit);
});

var onFormSubmit = function () {
    if (getType() == 'date') {
        // по дате. переведем с unix-timestamp
        $('#offset').val(to_ts($('#offset').val()))
    } else {
        // по числу, ничего не надо делать
    }

    return true;
};
