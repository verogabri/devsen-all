var http = require('http');

// const config = process.env.NODE_ENV=='production' ? require("../config.production.json") : process.env.NODE_ENV=='staging' ? require("../config.staging.json") : require("../config.json");
const config = require("../config.json");

var request = require("request");

var GATEWAY = function () {

};


GATEWAY.prototype.request2 = function (options, callback, logger) {
    let self = this;
    
    request(options, function(error, response, body) {
        
        if(response && response.statusCode && response.statusCode==200){
            try{
                body = JSON.parse(body);
                if(callback) callback(false, body);
            }catch (e) {
                if(callback) callback(body, false);
            }
        }else{
            if(callback) callback(body, false);
        }
    });
};

GATEWAY.prototype.request = function (options, callback, logger) {

    let self = this;
    
    http.request(options, (resp) => {
        //if(resp.statusCode===200){
        let data = '';
        resp.setEncoding('utf8');
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            if (resp.statusCode == 200) {
                try {
                    data = JSON.parse(data);
                    if (callback) callback(false, data);

                } catch (e) {
                    if (callback) callback(data, false);
                }
            } else {
                if (callback) callback(data, false);
            }


        });

    }).on("error", (err) => {
        
        if (callback) callback(true, false);
        
    }).end();


};


GATEWAY.prototype.addOrder = function (data, callback, logger) {

    let options = {
        uri:  "http://"+config.gateway_url+':'+config.gateway_port+'/addOrder.php',
        method: 'POST',
        headers:{
            "Authorization": "Bearer "+data.token,
            //'Content-Length': qslength,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: JSON.stringify(data),
    };

    this.request2(options, callback, logger);

};

GATEWAY.prototype.getOrders= function (data, callback, logger) {

    let path = '/getOrders.php';
    if(data.id_customer){
        path += '?id_customer='+data.id_customer;

        if(data.id_order){
            path += '&id_order='+data.id_order;
        }
    }

    let options = {
        host: config.gateway_url,
        port: config.gateway_port,
        // path: '/getKitSubitems.php',
        path: path,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + data.token,
        }
    };
    
    this.request(options, callback, logger);

};

GATEWAY.prototype.getOrdersByCustomer = function (data, callback, logger) {

    let options = {
        uri:  "http://"+config.gateway_url+':'+config.gateway_port+'/getOrdersByCustomer.php',
        method: 'POST',
        headers:{
            "Authorization": "Bearer "+data.token,
            //'Content-Length': qslength,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: JSON.stringify(data),
    };

    this.request2(options, callback, logger);

};

GATEWAY.prototype.updateOrderStatus = function (data, callback, logger) {

    let options = {
        host: config.gateway_url,
        port: config.gateway_port,
        // path: '/getKitSubitems.php',
        path: '/updateOrderStatus.php?id_order='+parseInt(data.id_order,10)+"&status="+data.status,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + data.token,
        }
    };
    
    this.request(options, callback, logger);

};


GATEWAY.prototype.deleteOrder = function (data, callback, logger) {

    let options = {
        host: config.gateway_url,
        port: config.gateway_port,
        // path: '/getKitSubitems.php',
        path: '/deleteOrder.php?id_order='+parseInt(data.id_order,10),
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + data.token,
        }
    };
    
    this.request(options, callback, logger);

};



GATEWAY.prototype.addCustomer = function (data, callback, logger) {

    let options = {
        uri:  "http://"+config.gateway_url+':'+config.gateway_port+'/addCustomer.php',
        method: 'POST',
        headers:{
            "Authorization": "Bearer "+data.token,
            //'Content-Length': qslength,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: JSON.stringify(data),
    };

    this.request2(options, callback, logger);

};

GATEWAY.prototype.updateCustomer = function (data, callback, logger) {

    let options = {
        uri:  "http://"+config.gateway_url+':'+config.gateway_port+'/updateCustomer.php',
        method: 'POST',
        headers:{
            "Authorization": "Bearer "+data.token,
            //'Content-Length': qslength,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: JSON.stringify(data),
    };

    this.request2(options, callback, logger);

};


GATEWAY.prototype.getCustomer = function (data, callback, logger) {

    let path = '/getCustomer.php';
    if(data.name_customer){
        path += '?name_customer='+data.name_customer;
    }

    let options = {
        host: config.gateway_url,
        port: config.gateway_port,
        // path: '/getKitSubitems.php',
        path: path,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + data.token,
        }
    };
    
    this.request(options, callback, logger);

};


GATEWAY.prototype.deleteCustomer = function (data, callback, logger) {

    let options = {
        host: config.gateway_url,
        port: config.gateway_port,
        // path: '/getKitSubitems.php',
        path: '/deleteCustomer.php?id_customer='+data.id_customer,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + data.token,
        }
    };
    
    this.request(options, callback, logger);

};


module.exports = GATEWAY;
