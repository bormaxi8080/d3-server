module.exports = {
    up: function(migration, DataTypes) {
        migration.createTable('change_logs', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            user_id:    { type: DataTypes.INTEGER,  allowNull: false },
            data:       { type: DataTypes.TEXT,     allowNull: false },
        }, {});
        migration.addIndex('change_logs', ['user_id']);

        migration.createTable('payments', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            user_id:        { type: DataTypes.INTEGER, allowNull: false },
            payment_code:   { type: DataTypes.STRING,  allowNull: false },
            product_code:   { type: DataTypes.STRING,  allowNull: false },
            redeemed:       { type: DataTypes.BOOLEAN, allowNull: false }
        }, {});
        migration.addIndex('payments', ['payment_code'], {indicesType: 'UNIQUE'});

        migration.createTable('room_data', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            room_id:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            data:       { type: DataTypes.TEXT }
        }, {});
        migration.addIndex('room_data', ['user_id', 'room_id'], {indicesType: 'UNIQUE'});

        migration.createTable('saved_states', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            comment:    { type: DataTypes.STRING,  allowNull: false },
            data:       { type: DataTypes.TEXT }
        }, {});

        migration.createTable('service_requests', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            network_id:  { type: DataTypes.INTEGER,  allowNull: false },
            social_id:   { type: DataTypes.STRING,   allowNull: false },
            service_id:  { type: DataTypes.STRING,  allowNull: false },
            data:        { type: DataTypes.TEXT },
            expires_date:{ type: DataTypes.BIGINT, allowNull: true, defaultValue: 0 }
        }, {});
        migration.addIndex('service_requests', ['network_id', 'social_id']);

        migration.createTable('sessions', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            user_id:    { type: DataTypes.INTEGER, allowNull: false },
            session_id: { type: DataTypes.STRING,  allowNull: false },
            locked:     { type: DataTypes.DATE,    allowNull: true },
            last_visit: { type: DataTypes.DATE },
        }, {});
        migration.addIndex('sessions', ['user_id'], {indicesType: 'UNIQUE'});

        migration.createTable('users', {
            id:         { type: 'SERIAL',           primaryKey: true },
            createdAt:  { type: DataTypes.DATE,     allowNull: false },
            updatedAt:  { type: DataTypes.DATE,     allowNull: false },

            social_network: { type: DataTypes.INTEGER,  allowNull: false },
            social_id:      { type: DataTypes.STRING,   allowNull: false },
            banned:         { type: DataTypes.DATE,     allowNull: true },
            revision:       { type: DataTypes.BIGINT,   allowNull: true, defaultValue: 0 },
            userData:       { type: DataTypes.TEXT },
            highscores:     { type: DataTypes.TEXT, defaultValue: '{}' },
            level:          { type: DataTypes.INTEGER,  allowNull: false, defaultValue: 1 },
            map_owner:      { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
            map_room:       { type: DataTypes.INTEGER,  allowNull: true, defaultValue: 0 },
            playerInfo:     { type:DataTypes.TEXT, allowNull: true, defaultValue: null },
            hints:          { type:DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            last_day_start: { type:DataTypes.BIGINT, allowNull: false, defaultValue: 0 }
        }, {});
        migration.addIndex('users', ['social_network', 'social_id'], {indicesType: 'UNIQUE'});

        migration.createTable('world_data', {
            id:             { type: 'SERIAL',           primaryKey: true },
            createdAt:      { type: DataTypes.DATE,     allowNull: false },
            updatedAt:      { type: DataTypes.DATE,     allowNull: false },

            user_id:        { type: DataTypes.INTEGER, allowNull: false, unique: true},
            data:           { type: DataTypes.TEXT },
            kingdom_name:   { type: DataTypes.STRING },
        }, {});
        migration.addIndex('world_data', ['user_id'], {indicesType: 'UNIQUE'});

        migration.createTable('share', {
            id: { type: 'SERIAL', primaryKey: true },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false },
            expiresAt: { type: DataTypes.DATE, allowNull: false },
            max_used: { type: DataTypes.INTEGER, allowNull: false },
            social_id: { type: DataTypes.STRING, allowNull: false },
            network_id: { type: DataTypes.INTEGER, allowNull: false },
            post_id: { type: DataTypes.INTEGER, allowNull: false },
            data: { type: DataTypes.STRING, allowNull: false },
            state: { type: DataTypes.BOOLEAN, allowNull: false, default: true}
        }, {});
        migration.addIndex('share', ['social_id', 'network_id', 'post_id'], {indicesType: 'UNIQUE'});

        migration.createTable('user_share', {
            id: { type: 'SERIAL', primaryKey: true },
            social_id: { type: DataTypes.STRING, allowNull: false },
            network_id: { type: DataTypes.INTEGER, allowNull: false },
            share_id: { type: DataTypes.INTEGER, allowNull: false },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        }, {});

        migration.createTable('hybrid_map', {
            link_code:  { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            link_id:    { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            hybrid_id:  { type: DataTypes.STRING, allowNull: false },
            createdAt:  { type: DataTypes.DATE,   allowNull: false },
            updatedAt:  { type: DataTypes.DATE,   allowNull: false }
        }, {});
        migration.addIndex('hybrid_map', ['hybrid_id']);
        migration.addIndex('hybrid_map', ['link_code', 'link_id']);

        migration.createTable('hybrid_id', {
            uid:        { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            links:      { type: DataTypes.TEXT, allowNull: false, defaultValue: "{}" },
            createdAt:  { type: DataTypes.DATE,   allowNull: false },
            updatedAt:  { type: DataTypes.DATE,   allowNull: false },
        }, {});
        migration.addIndex('hybrid_id', ['uid']);

        migration.createTable('token_map', {
            token_type: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            token:      { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            odin:       { type: DataTypes.STRING,  allowNull: true, defaultValue: null },
            network_id: { type: DataTypes.INTEGER, allowNull: false },
            social_id:  { type: DataTypes.STRING, allowNull: false }
        }, {});

    },

    down: function(migration, DataTypes) {

    }
}
