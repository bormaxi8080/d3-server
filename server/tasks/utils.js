var fs = require('fs');
var path = require('path');
var _isCi;

/**
    Добавляем ковычки спереди и вконце строки, если их еще нет
    Для параметра check выполняем fs.realpathSync
    @param check строка, для которой необходимо выполнить fs.realpathSync
    @param add дополнительная строка, которая суммируется с первым переданным аргументом
*/
var quotePath = function (check, add) {
    var resultString = fs.realpathSync(check) + (add ? add : '');
    path.normalize(resultString);
    return resultString.replace(/^"*/, "\"").replace(/"*$/, "\"");
};
exports.quotePath = quotePath;

// Получаем данные о билде от CI
var ciData = function() {
    var vcs_hash = process.env["VCS_HASH"];
    var build_number = process.env["build.number"];
    var data = [];
    // Если переменные окружения CI присутствуют - выполняем соответствующий код
    if (vcs_hash && build_number){
        data.push(build_number);
        data.push(vcs_hash);
    }
    return data;
}

var getUserCI = function() {
    var user =  { user_id:    process.env["secret.user_id"],
              project_id: process.env["secret.project_id"],
              secret_key: process.env["secret.secret_key"]};
    return user;
}

// Просерка - не из CI ли мы запускаемся
// Пока такая вот залипуха, которая опирается на переменные среды.
var isCi = function() {
    if (_isCi == undefined){
        var vcs_hash = process.env["VCS_HASH"];
        var build_number = process.env["build.number"];

        var red = "";
        var green = "";
        var blue = "";
        var yellow = "";
        var reset = "";

        if (vcs_hash && build_number){
            console.log("Build from CI \n VCS hash = "+vcs_hash+"\n Build number = "+build_number);
            _isCi = true;
        } else {
            _isCi = false;
            red = '\033[31m';
            blue = '\033[34m';
            green = '\x1b[32m';
            yellow = '\x1b[33m';
            reset = '\033[0m';
//            console.log(yellow+"Build local"+reset);
        }

        exports.red = red;
        exports.blue = blue;
        exports.green = green;
        exports.yellow = yellow;
        exports.reset = reset;
    }
    return _isCi;
}

exports.ciData = ciData;
exports.isCi = isCi;
exports.getUserCI = getUserCI;