var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('sessions', {
        user_id:    { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true },
        session_id: { type: Sequelize.STRING, allowNull: false },
        locked:     { type: Sequelize.DATE, allowNull: true }
    });
};