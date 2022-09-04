var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('token_map', {
        token_type:     { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        token:          { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        odin:           { type: Sequelize.STRING,  allowNull: true, defaultValue: null },
        network_id:     { type: Sequelize.INTEGER, allowNull: false },
        social_id:      { type: Sequelize.STRING, allowNull: false }
    }, {freezeTableName: true, timestamps: false});
};