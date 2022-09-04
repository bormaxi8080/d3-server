var url = require('url');
var http = require('http');
var Future = require('fibers/future');
var Buffer = require('buffer').Buffer;

var sync_request = module.exports = function(method, request_url, data) {
    var opts = url.parse(request_url);
    opts.method = method;
    opts.agent = false;
    var future = new Future();
    var req = http.request(opts, function(res) {
        var error = false;
        if (res.statusCode !== 200) {
            console.log("Error on http response " + request_url + ": received code " + res.statusCode);
            error = true;
        }
        var body = "";
        res.on("data", function(chunk) {
            body += chunk;
        });

        res.on("end", function(chunk) {
            if (error) { console.log("Error responce body:", body.toString()); }
            future.return(body.toString());
        });

        res.on("error", function(err) {
            console.log("Error on http response " + request_url + ": " + err);
            future.return(null);
        });
    });

    if (data) {
        if (data.multipart) {
            req.setHeader("Content-Length", Buffer.byteLength(data.content));
            req.setHeader("Content-Type", "multipart/form-data; boundary=\"" + data.boundary + "\"");
            req.write(data.content);
        } else {
            req.setHeader("Content-Length", Buffer.byteLength(data));
            req.write(data);
        }
    }

    req.end();

    req.on('error', function(err) {
        console.log("Error on http request " + request_url + ": " + err);
        future.throw({
            ConnectionError: true,
            url: request_url,
            message: err
        });
    });

    return future.wait();
};
