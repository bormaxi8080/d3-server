var Mixer = require("../../../core/Mixer");
var VKHandler = require("./VKHandler");


/**
 * @constructor
 */
var VKGetItemHandler = function(core, next) {
    var _self = this;
    this._logger = core.logger;

    var products = core.config().services.products["vk"];

    this.handle = function(task) {
        if (task.post.notification_type != 'get_item' &&
            task.post.notification_type != 'get_item_test') {
            task.next = next;
            _self.emit('complete', task);
        }
        else {
            var social_id = task.post.user_id;
            var product_code = task.post.item;
            var product = products[product_code];
            if (!product) {
                return _self.writeError(task.response, 2);
            }
            else {
                if (!("lang" in task.post)) {
                    return _self.writeError(task.response, 1);
                }

                var m = task.post.lang.match(/.*_(.{2})$/);
                if (!m || m.length < 1) {
                    return _self.writeError(task.response, 1);
                }
                var localeID = m[1];
                return _self.writeResponse(task.response, {title: product.title[localeID], price: product.cost});
            }
        }
    };
};


Mixer.mix(VKGetItemHandler.prototype, VKHandler.prototype);

module.exports = VKGetItemHandler;