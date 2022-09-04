/**
 * Обработчик, отдающий статический контент
 */
var path = require('path');
var fs = require('fs');
var url = require('url');
var http = require('http');
var exec = require('child_process').exec;
var util = require('util');

var Mixer = require("../core/Mixer");
var EventEmitter = require("events").EventEmitter;

var CdnDownloadTask = require("../utils/CdnDownloadTask");

if (process.env.DEV_ASSET_DIR)
    process.env.DEV_ASSET_DIR = fs.realpathSync(process.env.DEV_ASSET_DIR);

var CdnHandler = function(core, cdn_url, cache_dir, static_dir)
{
    var _self = this;
    var _logger = core.logger;

    this.cdn_url = cdn_url;
    this.cache_dir = cache_dir;
    this.static_dir = static_dir;
    this.asset_dir = process.env.DEV_ASSET_DIR; // папка для работы с ассетами вне CDN

    this.onComplete = function(fname) {
        _self.removeListeners();
        _self.sendFile(fname);
    };

    this.onError = function(resp_code) {
        _self.sendError(resp_code, resp_code+' File not found.');
    };

    this.onDirCreated = function(err, stdout, stderr) {
        if (err) throw err;
        else {
            _self.download_task = new CdnDownloadTask(_self.cdn_url + _self.file_path, path.join(_self.cache_dir, _self.fname), _logger);
            _self.download_task.addListener('complete', _self.onComplete);
            _self.download_task.addListener('error', _self.onError);
            _self.download_task.start();
        }
    };
};

Mixer.mix(CdnHandler.prototype, EventEmitter.prototype);

CdnHandler.prototype.sendFile = function(fname) {
    var stat = fs.statSync(fname);
    var headers = {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': 'mon, 21 sep 2012 12:00:00 gmt'
    }

    this.task.response.writeHead(200, headers);

    var readStream = fs.createReadStream(fname);
    util.pump(readStream, this.task.response);
};

CdnHandler.prototype.sendError = function(resp_code, body) {
    this.task.response.writeHead(resp_code);
    this.task.response.end(body);
};

CdnHandler.prototype.removeListeners = function() {
    this.download_task.removeListener('complete', this.onComplete);
    this.download_task.removeListener('error', this.onError);
};

CdnHandler.prototype.handle = function(task) {
    this.task = task;

    var _task = task;

    var fname_cached;
    var fname_static;
    var fname_asset;
    var match;
    var fname_without_version;

    // Отрезаем /cdn (м.б. в конфиг??)
    this.file_path = task.path.replace(/^[\/\\]cdn/, '');
    this.fname = path.normalize(this.file_path);

    if (this.fname.search('[:*?"|<>]') != -1) {
        // корявое имя файла (для винды)
        this.sendError(404, '404 File not found.');
        return;
    }

    match = this.fname.match(/^(.+\.)\d+\.([^\.]+)$/);
    if (match) {
        fname_without_version = match[1] + match[2];
    } else {
        fname_without_version = this.fname;
    }

    fname_cached = path.normalize(path.join(this.cache_dir, this.fname));
    fname_static = path.normalize(path.join(this.static_dir, fname_without_version));
    fname_asset = this.asset_dir ? path.normalize(path.join(this.asset_dir, fname_without_version)) : null;

    /*
    console.log('-----------------------');
    console.log('fname:', this.fname);
    console.log('fname_cached:', fname_cached);
    console.log('fname_static:', fname_static);
    console.log('-----------------------');
    */
/*  // Укороченная версия
    // при закачке из CDN не кешируем.
    if (fs.existsSync(fname_static)) {
        //console.log('-- CDN static: '+fname_static+' --');
        if (fs.lstatSync(fname_static).isDirectory()) {
            this.sendError(403, "Forbidden");
        } else {
            this.sendFile(fname_static);
        }
    } else {
        // Не кэшируем данные с CDN. Работаем как прокси.
        // TODO привести код в порядок.
        var file_url = this.cdn_url + file_path;
        var options = {
            host: url.parse(file_url).host,
            port: url.parse(file_url).port ? url.parse(file_url).port : 80,
            path: url.parse(file_url).pathname,
            method: 'GET'
        };

        var req = http.request(options, function(res) {
            //console.log('-- CDN proxy --');
            // BEG Отключаем кэширование
            res.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
            res.headers['pragma'] = 'no-cache';
            res.headers['expires'] = 'mon, 21 sep 2012 12:00:00 gmt';
            // END Отключаем кэширование

            _task.response.writeHead(res.statusCode, res.headers);
            res.addListener('data', function(chunk) {
                _task.response.write(chunk, 'binary');
            });
            res.addListener('end', function() {
                _task.response.end();
            });
        });
        req.addListener('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.end();
    }
*/
// Полная схема работы
    //_logger.info('----------------1 CDN ----------------', fname_without_version);
    if (fs.existsSync(fname_static)) {
//        _logger.info('-- Cdn Static --');

        if (fs.lstatSync(fname_static).isDirectory()) {
            this.sendError(403, "Forbidden");
        } else {
            this.sendFile(fname_static);
        }
    } else if (fname_asset && fs.existsSync(fname_asset)) {
//        _logger.info('-------------------------------- Asset Static --' + fname_asset);
        if (fs.lstatSync(fname_asset).isDirectory()) {
            this.sendError(403, "Forbidden");
        } else {
            this.sendFile(fname_asset);
        }
    } else if (fs.existsSync(fname_cached)) {
//        _logger.info('-- Cdn Cached --');

        if (fs.lstatSync(fname_cached).isDirectory()) {
            this.sendError(403, "Forbidden");
        } else {
            this.sendFile(fname_cached);
        }
    } else {
//        _logger.info('-- Cdn Load external --');
        require('wrench').mkdirSyncRecursive(path.dirname(fname_cached));
        this.onDirCreated();
    }
};

module.exports = CdnHandler;
