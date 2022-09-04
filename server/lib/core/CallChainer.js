
var EventEmitterExt = require('./EventEmitterExt')

var CallChainer = function() {
    this.blocks = [];
};
CallChainer.prototype.add = function(fct) {
    this.blocks.push(new EventEmitterExt(fct));
    return this;
};
CallChainer.prototype.run = function() {
    var self = this;
    return new EventEmitterExt(function(emitter){
        var runNext = function (id)
        {
            self.blocks[id]
                .success(function(res) {
                    id++;
                    if (id < self.blocks.length)
                        runNext(id);
                    else
                        emitter.emit('success', res);
                })
                .error(function(error){
                    emitter.emit('error', error);
                })
                .run();
        };
        if (self.blocks.length > 0)
            runNext(0);
        else
            emitter.emit('success');
    }).run();
};

module.exports = CallChainer;