/**
 * Module for gift service
 */

var Mixer = require("../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var Utils = require("../core/Utils");

var ShareHandler = function(core, next)
{
    this._core = core;
    this._models = this._core.modelFactory._models;
    this._next = next;
};

ShareHandler.prototype.handle = function(task)
{
    var params = task.get;
    if (!this.validate_params(params))
    {
        //@TODO просто редирект на игру
        this.redirect(params, task);
        return;
    }
    this.cookies = {};
    this.redirect(params, task);
};

ShareHandler.prototype.redirect = function(params, task)
{
    var network = this._core._cfg.findNetworkById(params.network_id);

    if (!network.hasOwnProperty("app_user_url"))
        throw new Error("app_user_url is not specified on network");

    //Добавлять id юзера в ссылку не имеет смысла
    //var url = network.app_user_url.replace(/{{social_id}}/, params.social_id);
    var url = network.app_user_url;

    // set headers
    var headers = [];
    headers.push(['Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0']);
    for (var param in params)
    {
        var expires = new Date();
        expires.setHours(expires.getHours() + 3);
        headers.push(['Set-Cookie', param + "=" + params[param] + "; path=/; expires=" + expires])
    }
    headers.push(["Location", url]);

    task.reply(301, {});
};

/**
 *
 * @param params
 * @param task
 */
ShareHandler.prototype.validate_params = function(params, task)
{
    var required_params = ["social_id", "network_id", "post_id"];
    return Utils.hasFields(params, required_params);
};

/**
 * Flatten and convert params to string
 * @param network social network object (@see config/development/app.yml)
 * @param params object
 * @param prefix string
 * @return String (example http://vk.com/112312_34234#post_id=1&network_id=1&social_id=11351&post_uid=32599fe754c24d97)
 */
ShareHandler.prototype.convert_params = function(network, params, prefix)
{
    if (network.name != "vk")
        return "";

    if (prefix)
        return prefix + Utils.params_to_url(params);
    else
        return Utils.params_to_url(params);
};

Mixer.mix(ShareHandler.prototype, EventEmitter.prototype);

module.exports = ShareHandler;