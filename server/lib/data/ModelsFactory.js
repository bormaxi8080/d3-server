var ModelsFactory = function(models) {
    this.models = models || {};
    this.dbBasis = null;
};

ModelsFactory.prototype.add = function(name, klass) {
    if (this.models[name])
        throw new Error('model "' + name + '" is already exists');

    this.models[name] = (this.dbBasis ? klass.get(this.dbBasis) : klass);
};

ModelsFactory.prototype.addModels = function(models) {
    for (var model in models) {
        this.add(model, models[model]);
    }
};

ModelsFactory.prototype.getModels = function(dbBasis) {
    if (!this.dbBasis) {
        for (var name in this.models)
            this.models[name] = this.models[name].get(dbBasis)
        this.dbBasis = dbBasis;
    }
    else if (this.dbBasis != dbBasis)
        throw new Error("invalid dbBasis");
    return this.models;
};

module.exports = ModelsFactory;