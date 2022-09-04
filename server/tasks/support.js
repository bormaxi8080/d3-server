var fs = require('fs');
var exec = require('child_process').exec;

red = '\033[31m';
blue = '\033[34m';
green = '\x1b[32m';
reset = '\033[0m';

var branchTTL;
var branchToRemove = [];
var branchesToSave = [];
var removeCmd = 'git push origin :%s;git branch -D %s;git branch -rd origin/%s';

namespace('defs', function ()
{
    desc('Скопировать карты во все стэйджы');
    task('copy_maps', [], function()
    {
        var execSync = require('exec-sync');
        var root = fs.realpathSync(__dirname + '/../../../');
        var configPath = root + '/server/config';

        var files = fs.readdirSync(configPath);
        files.splice(files.indexOf('development'), 1);
        console.log(files);
        for (var index = 0; index < files.length; index++)
        {
            var filePath = configPath + '/' + files[index];
            var file = fs.statSync(filePath);
            if (file.isDirectory())
            {
                console.log('copy maps to ' + filePath);
                execSync('cp ' + root + '/server/config/development/init_room_0.json ' + filePath + '/init_room_0.json');
                execSync('cp ' + root + '/server/config/development/init_room_1.json ' + filePath + '/init_room_1.json');
                execSync('cp ' + root + '/server/config/development/npc_room.json ' + filePath + '/npc_room.json');
            }
        }
        complete();
    });

    desc('Удалить неиспользуемые бранчи. Информацию о параметрах можно найти по адресу: https://docs.google.com/document/d/1-TgfmD82ICdqFMkOdPOSD7KhEi45mQbYUzIzgx6wEnc/edit');
    task('clean_branches', [], function()
    {
        // TODO уточнить необходимость смены дирктории
        var path = require('path');
        process.chdir(path.normalize(__dirname + '/../../../server'));

        checkState(arguments.length == 3, 'Wrong parameter numbers. Use [\"path\/to\/repository\", "path\/to\/branches_to_save"]');
        var repositoryPath = fs.realpathSync(__dirname + '/../../../' + arguments[0]);

        var savePath = arguments[1];
        branchTTL = arguments[2];
        checkPath(repositoryPath, "can\'t resolve repository path");
        checkPath(repositoryPath + '/.git', 'Path: \"' + repositoryPath + '\" is not repository');
        checkPath(savePath, "can\'t resolve save branches file");
        checkState(branchTTL >= 30, 'TTL of branch must be greater than 30 days');

        collectBranchesToSave();
        collectBranchesToRemove(onCollectBranches, repositoryPath);

        function collectBranchesToSave()
        {
            var branchToSave = fs.readFileSync(savePath);
            branchesToSave = prepareBranches(branchToSave.toString());
            branchesToSave.push('master');
            branchesToSave.push('develop');
        }

        function onCollectBranches()
        {
            removeNextBranch(onBranchesRemoved);
        }

        function onBranchesRemoved()
        {
            console.log('\n' + green + 'branch cleaning complete' + green);
            console.log(reset);
            complete();
        }

    }, true);
});

/**
 * Удалить ненужные бранчи
 */
function removeNextBranch(done)
{
    if (branchToRemove.length > 0)
    {
        var branch = branchToRemove.splice(0, 1);
        console.log('remove branch: ' + branch);

        var exp = /%s/g;
        var cmd = removeCmd.replace(exp, branch);
        console.log(cmd);
        exec(cmd, {cwd: repositoryPath}, function(error, stdout, stderr)
        {
            console.log(stdout);
            console.log(stderr);
            removeNextBranch(done);
        });
    }
    else
    {
        done();
    }
}

/**
 * Спарсить и подготовить названия бранчей
 * @param branchesStr бранчи строкой (из файла или git branch -r)
 * @return {*} массив названий бранчей
 */
function prepareBranches(branchesStr)
{
    var branches = branchesStr.split('\n');
    var i;
    for (i = 0; i < branches.length; i++)
    {
        branches[i] = branches[i].trim().replace('origin/', '');
    }
    while (branches.indexOf('') != -1)
    {
        branches.splice(branches.indexOf(''), 1);
    }
    return branches;
}

/**
 * Собрать бранчи на удаление
 * @param done колбэк завершения сбора бранчей
 * @param repositoryPath путь до целевого репозитория
 */
function collectBranchesToRemove(done, repositoryPath)
{
    var allBranches;
    exec('git branch -r', {cwd: repositoryPath}, function(error, stdout, stderr)
    {
        allBranches = prepareBranches(stdout);
        findNextOldBranch();
    });

    function findNextOldBranch()
    {
        if (allBranches.length > 0)
        {
            var branch = allBranches.splice(0, 1)[0];
            exec('git log origin/' + branch + ' -1 --format="%at"', {cwd: repositoryPath}, function(error, stdout, stderr)
            {
                var ttl = branchTTL * 24 * 60 * 60;
                var lastModifyTime = parseInt(stdout.trim());
                var now = Math.round(Date.now() / 1000);
                var branchLiveTime = now - lastModifyTime;
                if (branchLiveTime > ttl && branchesToSave.indexOf(branch) == -1)
                {
                    branchToRemove.push(branch);
                }
                findNextOldBranch();
            });
        }
        else
        {
            done();
        }
    }
}

/**
 * Проверить состояние
 * @param statement проверяемое состояние
 * @param msg сообщение выводимое в ошибке
 */
function checkState(statement, msg)
{
    if (!statement) throw new Error(msg ? msg : "Invalid state!");
}

/**
 * Проверить существование файла/дирректории
 * @param path путь до файла/дирректории
 * @param msg сообщение выводимое в ошибке
 */
function checkPath(path, msg)
{
    try
    {
        fs.statSync(path);
    } catch (e)
    {
        console.log(red + (msg ? msg : ('cant resolve path: "' + path + '"')) + red);
        throw e;
    }
}
