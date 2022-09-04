var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('saved_states', {
        user_id:    { type: Sequelize.INTEGER, allowNull: false },
        comment:    { type: Sequelize.STRING, allowNull: false },
        data:       { type: Sequelize.TEXT }
    });
};