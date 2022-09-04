var Sequelize = require("sequelize");

exports.get = function(dbBasis) {
    return dbBasis.define('users', {
        social_network: { type: Sequelize.INTEGER, allowNull: false },
        social_id:      { type: Sequelize.STRING, allowNull: false },
        banned:         { type: Sequelize.DATE, allowNull: true },
        revision:       { type: Sequelize.BIGINT, defaultValue: 0, allowNull: false },
        userData:       { type: Sequelize.TEXT },
        highscores:     { type: Sequelize.TEXT, defaultValue: '{}' },
        playerInfo:     { type: Sequelize.TEXT },
        level:          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        hints:          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        last_day_start: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0},
        map_owner:      { type: Sequelize.STRING, allowNull: true, defaultValue: null },
        map_room:       { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }
    },{
        instanceMethods: {
            getWorld: function() {
                var WorldData = require('./WorldData').get(dbBasis);
                return WorldData.using(this.social_id).find({ where: {user_id: this.id}});
            },
            getLocation: function() {
                return {map_social_id: this.map_owner ? this.map_owner : this.social_id, current_room: this.map_room};
            },
            getServiceRequests: function(service_id, limit) {
                var find_params = {where: {social_id: this.social_id, network_id: this.social_network}};
                if (service_id) find_params.where.service_id = service_id;
                if (limit) find_params.limit = limit;
                var ServiceRequest = require('./ServiceRequest').get(dbBasis);
                return ServiceRequest.using(this.social_id).findAll(find_params);
            },
        }
    });
};
