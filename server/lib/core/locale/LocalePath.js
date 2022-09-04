var path = require('path');

var DEF_LOCALE_DIR = 'localization/def';
var GUI_LOCALE_DIR = 'localization/gui';
var TO_TRANSLATE_DIR = 'localization/toTranslate';

/**
    Все пути относительно каталога дефов
*/


/**
    Путь до каталога локализации дефов
*/
exports.DEF_LOCALE_DIR = path.normalize(DEF_LOCALE_DIR);

/**
    Путь до каталога локализации ГУИ
*/
exports.GUI_LOCALE_DIR = path.normalize(GUI_LOCALE_DIR);

/**
    Путь до каталога с файлами локализации на перевод
*/
exports.TO_TRANSLATE_DIR = path.normalize(TO_TRANSLATE_DIR);

/**
    Путь до файла локализации дефов
*/
exports.DEF_LOCALE = function(localeExt)
{
    return path.join(DEF_LOCALE_DIR, 'locale' + localeExt + '.json');
}

/**
    Путь до файла локализации ГУИ
*/
exports.GUI_LOCALE = function(localeExt)
{
    return path.join(GUI_LOCALE_DIR, 'locale' + localeExt + '.json');
}

exports.TO_TRANSLATE_FILE = function(localeExt)
{
    return path.join(TO_TRANSLATE_DIR, 'toTranslate_locale' + localeExt + ".json");
}