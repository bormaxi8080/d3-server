var Sequelize = require("sequelize");

exports.get = function(dbBasis)
{
    return dbBasis.define('share', {
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
            expiresAt: { type: Sequelize.DATE, allowNull: false },
            max_used: { type: Sequelize.INTEGER, allowNull: false },
            social_id: { type: Sequelize.INTEGER, allowNull: false },
            network_id: { type: Sequelize.INTEGER, allowNull: false },
            post_id: { type: Sequelize.INTEGER, allowNull: false },
            data: { type: Sequelize.STRING, allowNull: false },
            state: { type: Sequelize.BOOLEAN, allowNull: false, default: true}
        },
        {
            instanceMethods: {
                is_active: function(count_use, social_id, network_id)
                {
                    var _self = this;

                    //is this my share?
                    if (_self.social_id == social_id && _self.network_id == network_id)
                    {
                        return false;
                    }

                    var conditions = [
                        (_self.state == true), //share must be active (over 0)
                        (_self.max_used && (_self.max_used > count_use)), //the number of users who have used this action
                        (_self.expiresAt >= new Date()) //expires date
                    ];

                    conditions.forEach(function(condition)
                    {
                        if (condition === false)
                        {
                            if (_self.state == true)
                            {
                                _self.state = false;
                                _self.save();
                            }
                            return false;
                        }

                    });

                    return true;
                }
            },
            freezeTableName: true
        }
    );
};