
import GATEWAY from '../models/gateway';


var Customer = function (data) {
    this.customer = data;
};

Customer.prototype.customer = {};


/**
 * 
 * @param {*} data 
 * @param {*} db 
 * @param {*} callback 
 * @param {*} logger 
 */
Customer.prototype.addCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.addCustomer(data, function(err, Customer) {
        if (!err) {
            if(callback) callback(false, Customer);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};

Customer.prototype.updateCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.updateCustomer(data, function(err, Customer) {
        if (!err) {
            if(callback) callback(false, Customer);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};

Customer.prototype.getCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.getCustomer(data, function(err, Customer) {
        if (!err) {
            if(callback) callback(false, Customer);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};



Customer.prototype.deleteCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.deleteCustomer(data, function(err, Customer) {
        if (!err) {
            if(callback) callback(false, Customer);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};


module.exports = Customer;
