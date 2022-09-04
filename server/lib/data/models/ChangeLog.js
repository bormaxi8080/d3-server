var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('change_log', {
        user_id:    { type: Sequelize.INTEGER, allowNull: false },
        data:       { type: Sequelize.TEXT, allowNull: false }
    });
};