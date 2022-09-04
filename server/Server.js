var path = require('path');
var SqWare = require('./lib/SqWare');
process.env.NODE_ENV  = process.env.NODE_ENV || 'development'
var configPath = path.join(__dirname, 'config', process.env.NODE_ENV);
var sqware = new SqWare(configPath);

sqware.run(process.env.PORT || sqware.config().app().port);
