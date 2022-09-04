var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('world_data', {
        user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true },
        data:    { type: Sequelize.TEXT },
        kingdom_name:{ type: Sequelize.STRING }
    });
};
