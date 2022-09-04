var _ = require('underscore');

var Task = function(request, response) {
    this.request = request;
    this.response = response;
    this.data = null;
    this.closed = false;
};

Task.prototype.reply = function(code, headers, body) {
    if (!this.closed) {
        if (!(body instanceof Buffer) && typeof(body) === 'object') {
            body = JSON.stringify(body, null, 2);
            headers['Content-Type'] = 'application/json';
        }
        this.response.writeHead(code, headers);
        this.response.end(body);
        this.closed = true;
    }
};

module.exports = Task;
