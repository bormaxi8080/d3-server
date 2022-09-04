var CreateUseShareQuery = function(mgr) {
    var _self = this;
    this.manager = mgr;
    var _models = mgr.models;

    this.result = {
        status: 'ERROR',
        error: 'ERROR',
        data: {}
    };

    // Вынесено, для наличия общего списка и возможности перевести на числа, если таковая возникнет
    var eCodes = {
        OK: 'OK',
        NOT_FOUND: 'NOT_FOUND', // Нет такого подарка
        SELF_GIFT: 'SELF_GIFT', // Нельзя дарить себе
        ALREADY_USED: 'ALREADY_USED', // Уже использовано
        EXPIRED: 'EXPIRED', // Устарел
        MAX_USED: 'MAX_USED', // Использовано максимальное кол-во.
        NOT_ACTIVE: 'NOT_ACTIVE', // Не активно
        DB_ERROR: 'DB_ERROR', // Ошибка БД
        ERROR: 'ERROR'
    };

    this.findActiveShare = function(network_id, social_id, post_id) {
        return _models.Share
            .using_shard(_self.sharing_shard_id)
            .find({ where: {network_id: network_id, social_id: social_id, post_id: post_id}})
    };

    this.findUserShare = function(network_id, social_id, share_id) {
        return _models.UserShare
            .using_shard(_self.sharing_shard_id)
            .find({where: {network_id: network_id, social_id: social_id, share_id: share_id}})
    };

    this.createUserShare = function(network_id, social_id, share_id) {
        return  _models.UserShare
            .using_shard(_self.sharing_shard_id)
            .create({social_id: social_id, network_id: network_id, share_id: share_id})
    };

    this.countUsing = function(share_id) {
        return _models.UserShare
            .using_shard(_self.sharing_shard_id)
            .count({where: {share_id: share_id}})
    };

    this.createRequest = function(network_id, social_id, share_data) {
        var request = _models.ServiceRequest.using_shard(_self.shard_id).build({
            social_id: social_id,
            network_id: network_id,
            service_id: 'sharing_apply',
            data: JSON.stringify({response: {data: JSON.parse(share_data)}})
        });
        request.save();
    };

    this.error = function(error, error_type, track) {
        // TODO error to log?
        if (!error_type) error_type = eCodes.ERROR;

        _self.result.status = 'ERROR';
        _self.result.error = error_type;

        _self.emit("error");
        return false;
    };

    this.db_error = function(error) {
        console.log(error);
        _self.emit("error");
        return false;
    };

    this.successFindUserShare = function(user_share) {
        if (user_share) {
            // Уже есть в таблице user_share
            _self.error('', eCodes.ALREADY_USED);
        } else {
            //console.log(_self.network_id, _self.social_id, _self.share.id);
            _self.createUserShare(_self.network_id, _self.social_id, _self.share.id)
                .success(function(user_share) {
                    // Создали запись.
                    _self.createRequest(_self.network_id, _self.social_id, _self.share.data);
                    _self.result.status = 'OK';
                    _self.result.error = '';

                    _self.emit("complete");
                })
                .error(function(error) {
                    _self.db_error(error);
                });
        }
    };

    this.run = function(social_id, network_id, params) {
        _self.shard_id = _models.User.daoFactoryManager.sequelize.getShardFor(social_id);

        // TODO: сделать корректную обработку таких ситуаций
        if (!params.sharing_social_id) params.sharing_social_id = '0';

        _self.sharing_shard_id = _models.User.daoFactoryManager.sequelize.getShardFor(params.sharing_social_id);
        _self.social_id = social_id;
        _self.network_id = network_id;
        _self.params = params;

        var post_id = params.post_id;
        process.nextTick(function() {
            _self.findActiveShare(params.sharing_network_id, params.sharing_social_id, post_id)
                .success(function(share) {
                    if (!share) {
                        _self.error('Share with post_id=' + post_id + ' not found', eCodes.NOT_FOUND, true);
                        return false;
                    }

                    _self.share = share;
                    _self.countUsing(_self.share.id)
                        .success(function(count_use) {
                            if (_self.share.social_id == social_id && _self.share.network_id == network_id) {
                                // Нельзя дарить самому себе
                                _self.error('Can\'t make gift to himself.', eCodes.SELF_GIFT);
                            }
                            else if (_self.share.expiresAt < new Date()) {
                                _self.error('Expiried.', eCodes.EXPIRED);
                            }
                            else if (_self.share.max_used && (_self.share.max_used <= count_use)) {
                                _self.error('Max used.', eCodes.MAX_USED);
                            }
                            else if (_self.share.is_active(count_use, social_id, network_id)) {
                                _self.findUserShare(network_id, social_id, _self.share.id)
                                    .success(_self.successFindUserShare)
                                    .error(_self.db_error);
                            }
                            else {
                                // Не активен. Возможно сам себе пытался подарить, возможно по условиям вылетел
                                _self.error('Not active share.', eCodes.NOT_ACTIVE);
                            }
                        })
                        .error(_self.db_error);
                    // END _self.countUsing(_self.share.id)
                })
                .error(_self.db_error);
            // END _self.findActiveShare(params.sharing_network_id, params.sharing_social_id, post_id)
        });
    };
};

module.exports = CreateUseShareQuery;
