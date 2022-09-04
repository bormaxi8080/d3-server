var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('hybrid_id', {
        uid: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        links: { type: Sequelize.TEXT, allowNull: false, defaultValue: "{}" }
    }, {freezeTableName: true});
};