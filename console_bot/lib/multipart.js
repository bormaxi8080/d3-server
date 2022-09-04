var LB = "\r\n"
var DD = "--"
var boundaryChars = "-_1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

var HTTPVariable = function(name, value) {
    this.name = name;
    this.value = value;
    return this;
};

HTTPVariable.prototype.toString = function() {
    var str = "Content-Disposition: form-data; name=\"" + this.name + "\"" + LB
    var value = this.value;
    if(typeof(this.value) === 'object') {
        str += "Content-Type: application/octet-stream" + LB;
        str += "Content-Transfer-Encoding: binary" + LB;
        value = JSON.stringify(value);
    }
    return str + LB + value.toString() + LB;
};

var getRandomBoundary = function() {
    var sourceLength = boundaryChars.length;
    var len = 30 + ~~(Math.random() * 11);
    var index = 0;
    var result = "";
    while (len--) {
        index = ~~(Math.random() * sourceLength);
        result += boundaryChars.charAt(index);
    }
    return result;
};

var generateBody = function(params, boundary) {
    var data = "";
    var param_value;
    for (var param_name in params) {
        param_value = params[param_name];
        data += DD + boundary + LB;
        data += new HTTPVariable(param_name, param_value).toString()
    }

    return data + DD + boundary + DD + LB;
};

module.exports = function(data) {
    var boundary = getRandomBoundary();
    return {
        multipart: true,
        content: generateBody(data, boundary),
        boundary: boundary
    }
};
