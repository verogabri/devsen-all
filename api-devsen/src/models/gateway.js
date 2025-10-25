var http = require('http');

// const config = process.env.NODE_ENV=='production' ? require("../config.production.json") : process.env.NODE_ENV=='staging' ? require("../config.staging.json") : require("../config.json");
const config = require("../config.json");

var request = require("request");

var GATEWAY = function () {

};


GATEWAY.prototype.request2 = function (options, callback, logger) {
    let self = this;
    
    // this.log(logger, "request2 : options =" + options, 'info');

    request(options, function(error, response, body) {
        
        // self.log(logger, "request2 : body =" + body, 'info');
        // self.log(logger, "request2 : response" + JSON.stringify(response), 'info');

        if(response.statusCode==200){
            try{
                body = JSON.parse(body);
                if(callback) callback(false, body);
            }catch (e) {
                // self.log(logger, JSON.stringify(e), 'error');
                if(callback) callback(body, false);
            }
        }else{
            // self.log(logger, JSON.stringify(body), 'error');
            if(callback) callback(body, false);
        }
    });
};

GATEWAY.prototype.request = function (options, callback, logger) {

    let self = this;
    this.log(logger, options, 'info');
    
    http.request(options, (resp) => {
        //if(resp.statusCode===200){
        let data = '';
        resp.setEncoding('utf8');
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            self.log(logger, data, 'info');
            if (resp.statusCode == 200) {
                try {
                    data = JSON.parse(data);
                    if (callback) callback(false, data);

                } catch (e) {
                    self.log(logger, e, 'error');
                    if (callback) callback(data, false);
                }
            } else {
                self.log(logger, data, 'error');
                if (callback) callback(data, false);
            }


        });

    }).on("error", (err) => {
        
        if (callback) callback(true, false);
        self.log(logger, err, 'error');

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

    let options = {
        host: config.gateway_url,
        port: config.gateway_port,
        // path: '/getKitSubitems.php',
        path: '/getCustomer.php?name_customer='+data.name_customer,
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
        path: '/deleteCustomer.php?name_customer='+data.name_customer,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + data.token,
        }
    };
    
    this.request(options, callback, logger);

};


module.exports = GATEWAY;
