var RequestCounter = function() {
    this.active_requests = 0;
}

RequestCounter.prototype.inc = function() {
    this.active_requests += 1;
}

RequestCounter.prototype.dec = function() {
    this.active_requests -= 1;
}

RequestCounter.prototype.hasActiveRequest = function() {
    return (this.active_requests == 0);
}

RequestCounter.prototype.activeRequestCount = function() {
    return this.active_requests;
}

module.exports = RequestCounter;