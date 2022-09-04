var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('hybrid_map', {
        link_code: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        link_id: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        hybrid_id: { type: Sequelize.STRING, allowNull: false }
    }, {freezeTableName: true});
};