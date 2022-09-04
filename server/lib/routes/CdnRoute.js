var fs = require('fs');
var FastHandlerChain = require("../core/net/FastHandlerChain");

var CdnRoute = function(core) {
    var handlers = core.handlerFactory.list();
    var app_config = core.config().app();
    this.core = core;
    this.cdn_url = app_config.cdn_root_url;
    this.cache_dir = fs.realpathSync(app_config.cdn_cache_dir);
    this.static_dir = fs.realpathSync(app_config.static_dir);

    this.chain = new FastHandlerChain("parser", {
        parser: new handlers.BodyParser(core, "cdn"),
        cdn:    new handlers.CdnHandler(core, this.cdn_url, this.cache_dir, this.static_dir)
    });
};

CdnRoute.prototype.createChain = function() {
    return this.chain;
};

module.exports = CdnRoute;
