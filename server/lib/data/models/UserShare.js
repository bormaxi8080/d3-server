var Sequelize = require("sequelize");

exports.get = function(dbBasis)
{
    return dbBasis.define('user_share', {
        createdAt: { type: Sequelize.DATE, allowNull: false },
        social_id: { type: Sequelize.INTEGER, allowNull: false },
        network_id: { type: Sequelize.INTEGER, allowNull: false },
        share_id: { type: Sequelize.INTEGER, allowNull: false }
    }, {
        freezeTableName: true
    });
};