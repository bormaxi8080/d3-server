var RouteFactory = function(core) {
    this.core = core;
    this.routes = {}
};

RouteFactory.prototype.add = function(name, route) {
    if (this.routes[name]) {
        throw new Error('route "' + name + '" is already exists');
    }

    this.routes[name] = route;
};

RouteFactory.prototype.addRoutes = function(routes) {
    for (var route in routes) {
        this.add(route, routes[route]);
    }
};

RouteFactory.prototype.getRoute = function(name) {
    var route = this.routes[name];
    return route || null;
};

RouteFactory.prototype.initRoutes = function(bootstrap) {
    for (var name in this.routes) {
        if (name == '__base') {
            continue;
        }
        bootstrap.route(name, new this.routes[name](this.core));
    }
};

module.exports = RouteFactory;
