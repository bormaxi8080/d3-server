var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('service_request', {
        network_id:  { type: Sequelize.INTEGER, allowNull: false },
        social_id:   { type: Sequelize.STRING, allowNull: false },
        service_id:  { type: Sequelize.STRING, allowNull: false },
        data:        { type: Sequelize.TEXT },
        expires_date:{ type: "BIGINT", defaultValue: 0 }
    });
};