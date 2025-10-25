import resource from 'resource-router-middleware';

import Customers from "../models/customers";

var error = {"error":"not permitted"};

export default ({ config, db }) => resource({

  /** Property name to store preloaded entity on `request`. */
  id : 'customers',

})
.post('/', function(req, res, next) {

    const name = req.body.name ? req.body.name : '';
    const surname = req.body.surname ? req.body.surname : '';
    const address_text = req.body.address_text ? req.body.address_text : '';
    const city = req.body.city ? req.body.city : '';
    const email = req.body.email ? req.body.email : '';
    const phone = req.body.phone ? req.body.phone : '';

    if (req.user) {
        if (name && email ) {

            const array_data = {
                name: name,
                surname: surname,
                address_text: address_text,
                city: city,
                phone: phone,
                email: email,
                token: req.user.access_token,
            };

            const customer = new Customers();
            customer.addCustomer(array_data, db, function (error, response) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(500).send({error: 'error adding customer'});
                }
            });
        } else {
            res.status(400).send({error: 'missing data'});
        }

    } else {
        res.status(401).send({error: 'not permitted'});
    }

})

.put('/:id_customer', function(req, res, next) {

    const id_customer = req.params.id_customer ? req.params.id_customer : '';
    const name = req.body.name ? req.body.name : '';
    const surname = req.body.surname ? req.body.surname : '';
    const address_text = req.body.address_text ? req.body.address_text : '';
    const city = req.body.city ? req.body.city : '';
    const email = req.body.email ? req.body.email : '';
    const phone = req.body.phone ? req.body.phone : '';

    if (req.user) {
        if (id_customer ) {

            const array_data = {
                id_customer: id_customer,
                name: name,
                surname: surname,
                address_text: address_text,
                city: city,
                phone: phone,
                email: email,
                token: req.user.access_token,
            };

            const customer = new Customers();
            customer.updateCustomer(array_data, db, function (err, response) {
                if (!err) {
                    res.status(200).send(response);
                } else {
                    res.status(500).send(err);
                }
            });
        } else {
            res.status(400).send({error: 'missing data'});
        }

    } else {
        res.status(401).send({error: 'not permitted'});
    }

})

.get('/get', function(req, res, next) {

    if(req.user){
        const customer = new Customers();
        customer.getCustomer({token: req.user.access_token}, db, function (error, response) {

            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(500).send(error);
            }
        });
        
    }else{
        res.status(401).send({error:'no user'});
    }

})

.get('/get/:name_customer', function(req, res, next) {

    const name_customer = req.params.name_customer ? req.params.name_customer : '';
    
    if(req.user){
        const customer = new Customers();
        customer.getCustomer({name_customer: name_customer, token: req.user.access_token}, db, function (response, error) {

            

            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(404).send(error);
            }
        });
        
    }else{
        res.status(401).send(error);
    }

})


.get('/test', function(req, res, next) {

    res.status(200).send({status: 'ok'});

})

.delete('/:id_customer', function(req, res, next) {
    const id_customer = req.params.id_customer ? req.params.id_customer : '';
    
    if(req.user){
        const customer = new Customers();
        customer.deleteCustomer({id_customer: id_customer, token: req.user.access_token}, db, function (response, error) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(404).send(error);
            }
        });
        
    }else{
        res.status(401).send(error);
    }

})

