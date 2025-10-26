
import GATEWAY from '../models/gateway';


var Orders = function (products) {
    this.orders = products;
};

Orders.prototype.orders = {};


/**
 * invia i dati dell'ordine a extranet extranet_gateway/addOrder.php
 * @param {*} data 
 * @param {*} db 
 * @param {*} callback 
 * @param {*} logger 
 */
Orders.prototype.addOrder = function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.addOrder(data, function(orders, err) {

        if (!err) {
            if(callback) callback(false, orders);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};


Orders.prototype.getOrders = function (data, db, callback, logger) {
    let self = this;
    let extranet = new GATEWAY();
    extranet.getOrders(data, function (err, orders) {

        if (!err) {
            if (callback) callback(false, orders);
        } else {
            // if(callback) callback({error:'Not Found'}, false);
            if (callback) callback({error: err}, false);
        }
    }, logger);
};

Orders.prototype.updateOrderStatus = function (data, db, callback, logger) {
    let self = this;
    let extranet = new GATEWAY();
    extranet.updateOrderStatus(data, function (err, orders) {
        
        if (!err) {
            if (callback) callback(false, orders);
        } else {
            // if(callback) callback({error:'Not Found'}, false);
            if (callback) callback({error: err}, false);
        }
    }, logger);
};

Orders.prototype.deleteOrder = function (data, db, callback, logger) {
    let self = this;
    let extranet = new GATEWAY();
    extranet.deleteOrder({ id_order: data.id_order, token: data.token}, function (err, orders) {

        
        if (!err) {
            if (callback) callback(false, orders);
        } else {
            // if(callback) callback({error:'Not Found'}, false);
            if (callback) callback({error: err}, false);
        }
    }, logger);
};


module.exports = Orders;
