
import GATEWAY from '../models/gateway';


var Customers = function (data) {
    this.customer = data;
};

Customers.prototype.customer = {};


/**
 * 
 * @param {*} data 
 * @param {*} db 
 * @param {*} callback 
 * @param {*} logger 
 */
Customers.prototype.addCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.addCustomer(data, function(response, err) {
        if (!err) {
            if(callback) callback(false, response);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};

Customers.prototype.updateCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.updateCustomer(data, function(err, response) {
        if (!err) {
            if(callback) callback(false, response);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};

Customers.prototype.getCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.getCustomer(data, function(err, Customers) {

        console.log("Customers getCustomer response:", Customers, err);
        
        if (!err) {
            if(callback) callback(false, Customers);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};



Customers.prototype.deleteCustomer= function (data, db, callback, logger) {

    var extranet = new GATEWAY();
    extranet.deleteCustomer(data, function(response, err) {
        
        console.log("Customers deleteCustomer response: response", response );
        console.log("Customers deleteCustomer response: err", err);

        if (!err) {
            if(callback) callback(false, response);
        }else{
            if(callback) callback(err, false);
        }
    }, logger);
};


module.exports = Customers;
