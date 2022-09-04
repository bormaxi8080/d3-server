var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('user_log', {
        user_id:    { type: Sequelize.INTEGER, allowNull: false },
        reason:     { type: Sequelize.STRING, allowNull: false } ,
        data:       { type: Sequelize.TEXT }
    });
};
