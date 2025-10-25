import resource from 'resource-router-middleware';

import Order from "../models/order";

const JSON = require('circular-json');

var error = {"error": "not permitted"};
// const UTIL = require("../lib/util");

export default ({config, db, logger}) => resource({

    /** Property name to store preloaded entity on `request`. */
    id: 'orders',

})

// crea un nuovo ordine
.post('/add', function (req, res, next) {

    try {
        

        const date = req.body.date ? new Date(req.body.date) : '';
        const total_amount = req.body.total_amount ? parseFloat(req.body.total_amount) : '';
        const id_customer   = req.body.id_customer ? req.body.id_customer : '';
        const status   = req.body.status ? req.body.status : '';

        let order = new Order();

       start();
          
        /**
         * se non ci sono stati errori con i dati e i permessi allora proseguo da qui
         * 
         */
        const start = function start() {

            // se ho la lista degli articoli, altrimneti
            if (id_customer && total_amount ) {

                const array_data = {
                    date: date,
                    total_amount: total_amount,
                    id_customer: id_customer,
                    status: status,
                    token: req.user.access_token,
                }

                // invia l'ordine a extranet
                order.addOrder(array_data, db, function (err, order_response) {

                    if (order_response.id_order && err === false) {

                        res.status(200).send(order_response);
                        return;

                    } else {
                        
                        res.status(500).send({error: "error in add order"});
                        return;
                    }

                }, logger);

            } else {

                res.status(500).send({error: "invalid data order" });
                 
            }

        };


    } catch (error) {

        // qualcosa è andato male
        // orderlogger.log({
        //     level: "info",
        //     message: " add : catch error = " + JSON.stringify(error),
        // });

        res.status(401).send({error: error});
    }

    //my response
})
// restituisce gli ordini di un cliente
.get('/get/:name_customer', function (req, res, next) {
    console.log("Getting orders for customer");
    
        let name_customer = req.params.name_customer ? req.params.name_customer : '';
        
        const orders = new Order();
        if (req.user) {
            orders.getOrdersByCustomer({
                name_customer: name_customer,
                token: req.user.access_token
            }, db, function (error, response) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(404).send(error);
                }
            }, logger);
        } else {
            res.status(401).send(error);
        }
        
})
// restituisce un ordine di un cliente
.get('/get/:name_customer/:id_order', function (req, res, next) {
        let name_customer = req.params.name_customer ? req.params.name_customer : '';
        let id_order = req.params.id_order ? parseInt(req.params.id_order, 10) : '';

        const orders = new Order();
        if (req.user) {
            orders.getOrdersByCustomer({
                name_customer: name_customer,
                id_order: id_order,
                token: req.user.access_token
            }, db, function (error, response) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(404).send(error);
                }
            }, logger);
        } else {
            res.status(401).send(error);
        }
        
})

// aggiorna lo stato di un ordine
.post('/status/:id_order/:status', function (req, res, next) {

        let id_order = req.params.id_order ? parseInt(req.params.id_order, 10) : '';
        let status = req.params.status ? req.params.status : '';

        const orders = new Order();
        if (req.user) {
            orders.updateOrderStatus({
                id_order: id_order,
                status: status,
                token: req.user.access_token
            }, db, function (error, response) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(404).send(error);
                }
            }, logger);
        } else {
            res.status(401).send(error);
        }
        
})

// aggiorna lo stato di un ordine
.delete('/:id_order', function (req, res, next) {

        let id_order = req.params.id_order ? parseInt(req.params.id_order, 10) : '';
        
        const orders = new Order();
        if (req.user) {
            orders.deleteOrder({
                id_order: id_order,
                token: req.user.access_token
            }, db, function (error, response) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(404).send(error);
                }
            }, logger);
        } else {
            res.status(401).send(error);
        }
        
})
;


