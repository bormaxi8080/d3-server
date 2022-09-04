//var Reports = function ()
//module.exports = function(locale, context, assets)
module.exports = function (isCI)
{
    var currentTest = ""
    var currentSuit = "";

    this.startTestSuit = function (name)
    {
        this.currentSuit = name;
        if (isCI) console.log("##teamcity[testSuiteStarted name='" + name + "']");
        else console.log("\033[0m" + name + "\033[0m");
    }

    this.finishTestSuit = function ()
    {
        if (isCI) console.log("##teamcity[testSuiteFinished name='" + this.currentSuit + "']");
        else console.log("\033[0m" + this.currentSuit + "\033[0m");
    }

    this.startTest = function (name)
    {
        this.currentTest = name;
        if (isCI) console.log("##teamcity[testStarted name='" + name + "']");
        else console.log("\033[0m" + "\nStart test: " + name + "\033[0m");
    }

    this.finishTest = function ()
    {
        if (isCI) console.log("##teamcity[testFinished name='" + this.currentTest + "']");
    }

    this.failTestMessage = function (message, details)
    {
        if (isCI) console.log("##teamcity[testFailed name='" + this.currentTest + "' message='" + message + "'  details='" + details + "']");
        else console.log("\033[0m" + message + "\033[0m", "\033[1;31m" + details + "\033[0m");
    }

    // Особая функция для отчета по тестам дефов
    this.failDefTestMessage = function (file, info)
    {
        if (isCI) console.log("##teamcity[testFailed name='" + this.currentTest + "' details='" + file + "; " + info + "']");
        else console.log("\033[1;31m" + info + "\033[0m", "\033[0m" + file + "\033[0m");
    }

    this.warningDefTestMessage = function (file, info)
    {
        if (isCI) console.log("##teamcity[text='" + file + "; " + info + "']");
        else console.log("\033[33m" + info + "\033[0m", "\033[0m" + file + "\033[0m");
    }

    // Особая функция для отчета по тестам дефов
    this.warningTestMessage = function (message)
    {
        if (isCI) console.log("##teamcity[name='" + this.currentTest + "' text='" + message + "']");
        else console.log("\x1b[33m" + message + "\x1b[0m");
    }

    this.log = function (text)
    {
        if (isCI) console.log("##teamcity[name='log' text='" + text + "']");
        else console.log("\033[0m" + text + "\033[0m");
    }

    return this;
}