/**
 * Модуль для верификации и записи платежей AppleStore в БД
 *
 * See http://developer.apple.com/library/ios/#documentation/NetworkingInternet/Conceptual/StoreKitGuide/APIOverview/OverviewoftheStoreKitAPI.html#//apple_ref/doc/uid/TP40008267-CH100-SW1
 * url для верификации тестовых платежей: https://sandbox.itunes.apple.com/verifyReceipt
 * url для верификации реальных платежей: https://buy.itunes.apple.com/verifyReceipt
 */

var Mixer = require("../../../core/Mixer");
var EventEmitter = require("events").EventEmitter;
var url = require('url');
var https = require('https');
var request = require('request');
var QueryCall = require("../../../core/Utils").QueryCall;

var PaymentProcessorHandler = function(core) {
    this.logger = core.logger;
    this.core = core;
    this.dataGate = core.dataGate;
    this.products = core.config().services.products.appstore;
};

PaymentProcessorHandler.prototype.handle = function(task) {
    this.social_id = task.post.social_id;
    this.network_id = task.post.social_network;
    if (this.core.config().app().fake_validation) {
        this.process_ios6_payment(task, {
            product_id: this.shop_id_by_inner_id(task.post.product_id),
            transaction_id: (~~(Math.random() * 100000000)).toString()
        });
    } else {
        this.perform_validation(task)
    }
};

PaymentProcessorHandler.prototype.shop_id_by_inner_id = function(inner_id) {
    for (var shop_id in this.products) {
        if (this.products[shop_id].inner_product_id == inner_id) {
            return shop_id;
        }
    }
};

PaymentProcessorHandler.prototype.perform_validation = function(task) {
    var self = this;
    var network_cfg = this.core.config().app().networks[this.network_id];
    var disable_stats = network_cfg.disable_stats;
    var verify_uri = url.parse(network_cfg.verify_url);
    var json_request = JSON.stringify({'receipt-data': task.post.receipt});

    var options = {
        host: verify_uri.hostname,
        port: verify_uri.port,
        path: verify_uri.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': json_request.length
        }
    };

    var req = (verify_uri.protocol == "https:" ? https : http).request(options, function(res) {
        var data = "";
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            data = JSON.parse(data);

            if (res.statusCode != 200 || data.status != 0) {
                self.logger.error('error appstore response status (' + res.statusCode + ',' + data.status + ')');
                self.reply(task, {error_code: "invalid_payment", message: "appstore response status: " + data.status});
                return self.emit("complete");
            }

            if (data.receipt.in_app) {
                self.process_ios7_payment(task, data.receipt);
            } else {
                self.process_ios6_payment(task, data.receipt);
            }
        });
    });

    req.on('error', function(e) {
        self.logger.error('problem with request: ' + e.message);
        self.reply(task, {"appstore": {error_code: "request_error"}});
        self.emit("complete");
    });

    req.write(json_request);

    req.end();
}

PaymentProcessorHandler.prototype.process_ios6_payment = function(task, receipt) {
    var self = this;
    var shard_id = this.dataGate.getShardFor(this.social_id);

    if (!self.products[receipt.product_id]) {
        self.logger.error('unknown product (' + receipt.product_id + ')');
        self.reply(task, {error_code: "unknown_product", message: "unknown product: " + receipt.product_id});
        return self.emit("complete");
    }

    var paymentRequest = {
        product_code: receipt.product_id,
        payment_code: receipt.transaction_id,
        store: "appstore",
        inner_product_id: self.products[receipt.product_id].inner_product_id
    };

    this.dataGate.begin(shard_id)
    .success(function(conn) {
        QueryCall(self.dataGate, 'serviceExecute',[
            self.network_id,
            self.social_id,
            'payment',
            paymentRequest,
            conn
        ])
        .success(function(result) {
            conn.commit()
            .success(function() {
                var payment_services = {};
                payment_services[result.operation_id] = {
                    operation_id: result.operation_id,
                    result: {
                        store: paymentRequest.store,
                        product_id: result.data.response.product_id
                    }
                }
                self.reply(task, { "services": {"payment": payment_services}});
            })
            .error(function(error) {
                self.logger.error('payment commit failed: ' + error);
                self.reply(task, {error_code: "query_error"})
            })
        })
        .error(function(error) {
            conn.rollback();
            self.reply(task, {error_code: "query_error"})
        })
    })
    .error(function(error) {
        self.logger.error('payment begin failed: ' + error);
        self.reply(task, {error_code: "query_error"})
    });
};

PaymentProcessorHandler.prototype.process_ios7_payment = function(task, receipt) {
    var self = this;
    var shard_id = this.dataGate.getShardFor(self.social_id);

    var transactions = {};
    receipt.in_app.forEach(function(in_app) {
        transactions[in_app.original_transaction_id] = in_app.product_id;
    });

    this.dataGate.begin(shard_id)
    .success(function(conn) {
        QueryCall(self.dataGate, 'filterNewPayments', [
            self.network_id, self.social_id, Object.keys(transactions), conn
        ])
        .success(function(new_trasactions) {
            var chainer = self.dataGate.getQueryChainer();

            new_trasactions.forEach(function(transaction_id) {
                var product_id = transactions[transaction_id];
                var paymentRequest = {
                    payment_code: transaction_id,
                    product_code: product_id,
                    store: "appstore",
                    inner_product_id: self.products[product_id].inner_product_id
                };
                if (self.products[product_id]) {
                    chainer.add(QueryCall(self.dataGate, 'serviceExecute', [
                        self.network_id, self.social_id, 'payment', paymentRequest, conn
                    ]));
                } else {
                    self.logger.warn('Unknown product (' + product_id + ')');
                }
            });

            chainer.run().success(function(results) {
                conn.commit()
                .success(function() {
                    var payment_services = {}
                    results.forEach(function(result) {
                        payment_services[result.operation_id] = {
                            operation_id: result.operation_id,
                            result: {
                                store: result.data.response.store,
                                product_id: result.data.response.product_id
                            }
                        }
                    });
                    self.reply(task, { "services": {"payment": payment_services}});
                })
                .error(function() {
                    self.logger.error('payment commit failed: ' + error);
                    self.reply(task, {error_code: "query_error"})
                })
            }).error(function(error) {
                conn.rollback();
                self.reply(task, {error_code: "query_error"})
            });
        })
        .error(function() {
            conn.rollback();
            self.reply(task, {error_code: "query_error"})
        });
    })
    .error(function(error) {
        self.logger.error('payment begin failed: ' + error);
        self.reply(task, {error_code: "query_error"})
    });

};

PaymentProcessorHandler.prototype.reply = function(task, reply) {
    this.logger.info('Payment Reply: ' + JSON.stringify(reply));
    task.reply(200, {"Content-Type": "application/json"}, JSON.stringify(reply));
};

Mixer.mix(PaymentProcessorHandler.prototype, EventEmitter.prototype);

module.exports = PaymentProcessorHandler;