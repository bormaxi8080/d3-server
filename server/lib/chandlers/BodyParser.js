var URL = require("url");
var qs = require('querystring');
var fs = require('fs');
var Formidable = require("formidable");
var domain = require('domain');

var JSONUtils = require('../data/JSONUtils');

var MAX_CONTENT_LENGTH = 1024 * 1024;

var BodyParser = function(core, next, maxContentLength) {
    this.next = next;
    this.core = core;
    this.logger = core.logger;

    this.maxContentLength = maxContentLength || MAX_CONTENT_LENGTH;
};

BodyParser.prototype.handle = function(task, callback) {
    var self = this;
    var requestInfo = URL.parse(task.request.url, true);

    task.get = requestInfo.query;
    task.path = requestInfo.pathname;

    var headers = prepareHeaders(task.request.headers);
    var fields = {};

    this.checkSize(headers["content-length"]);
    if (this.isMultipart(headers)) {
        var form = new Formidable.IncomingForm();
        form.parse(task.request, function(err, fields, files) {
            task.post = fields;
            self.addDomainMetadata(task);
            self.logger.info("POST:" + task.request.url);
            if (err) {
                task.request.end();
                task.closed = true;
                throw new Error("Formidable ERR: " + err);
            } else {
                return callback(null, self.next);
            }
        })
    } else {
        var requestBody = "";
        var readedSize = 0;
        task.request.on("data", function(chunk) {
            self.checkSize(readedSize += chunk.length)
            requestBody += chunk.toString();
        });
        task.request.on("end", function() {
            try {
                task.post = qs.parse(requestBody);
            } catch (err) {
                task.post = requestBody;
            }
            if (task.request.method == 'POST') {
                self.addDomainMetadata(task);
                self.logger.info("POST:" + task.request.url);
            }
            return callback(null, self.next);
        });
    }
};

BodyParser.prototype.addDomainMetadata = function(task) {
    if (domain.active) {
        domain.active.request_url = task.request.url;
        if (task.post) {
            domain.active.post_params = JSONUtils.clone(task.post);
            if (task.post.social_id) {
                domain.active.user_id = task.post.social_id;
                domain.active.network_id = task.post.social_network;
                domain.active.client_ip = task.request.connection.remoteAddress;
            }
        }
    }
};

BodyParser.prototype.isMultipart = function(headers) {
    var header = headers["content-type"];
    return header && header.indexOf("multipart/form-data") >= 0;
};

BodyParser.prototype.checkSize = function(size) {
    if (size && size > this.maxContentLength) {
        throw new Error ("ERROR. Too long request. Readed: " + size + "; Limit: "+ this.maxContentLength);
    }
};

var prepareHeaders = function(headers) {
    var result = {};
    for (var fieldName in headers) {
        if (typeof headers[fieldName] === "string") {
            result[fieldName.toLowerCase()] = headers[fieldName];
        }
    }
    return result;
};

module.exports = BodyParser;
