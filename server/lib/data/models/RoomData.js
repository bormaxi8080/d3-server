var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('room_data', {
        user_id:    { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
        room_id:    { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
        data:       { type: Sequelize.TEXT }
    });
};
