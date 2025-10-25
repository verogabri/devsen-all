import resource from 'resource-router-middleware';

import Customer from "../models/customers";

var error = {"error":"not permitted"};

export default ({ config, db }) => resource({

  /** Property name to store preloaded entity on `request`. */
  id : 'customers',

})
.post('/add', function(req, res, next) {

    const name = req.body.name ? req.body.name : '';
    const surname = req.body.surname ? req.body.surname : '';
    
    const address_text = req.body.address ? req.body.address : '';
    const city = req.body.city ? req.body.city : '';
    const phone = req.body.phone ? req.body.phone : '';
    const email = req.body.email ? req.body.email : '';


    if (req.user) {
        if (name && email ) {

            const array_data = {
                name: name,
                surname: surname,
                address: address_text,
                city: city,
                phone: phone,
                email: email,
                token: req.user.access_token,
            };

            const customer = new Customer();
            customer.addCustomer(array_data, db, function (response, error) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(500).send(error);
                }
            });
        } else {
            res.status(500).send({error: 'missing data'});
        }

    } else {
        res.status(500).send({error: 'not permitted'});
    }

})

.post('/update/:name_customer', function(req, res, next) {

    const name_customer = req.params.name_customer ? req.params.name_customer : '';
    const name = req.body.name ? req.body.name : '';
    const surname = req.body.surname ? req.body.surname : '';
    
    const address_text = req.body.address ? req.body.address : '';
    const city = req.body.city ? req.body.city : '';
    const phone = req.body.phone ? req.body.phone : '';
    const email = req.body.email ? req.body.email : '';


    if (req.user) {
        if (name && email ) {

            const array_data = {
                name_customer: name_customer,
                name: name,
                surname: surname,
                address: address_text,
                city: city,
                phone: phone,
                email: email,
                token: req.user.access_token,
            };

            const customer = new Customer();
            customer.updateCustomer(array_data, db, function (response, error) {
                if (!error) {
                    res.status(200).send(response);
                } else {
                    res.status(500).send(error);
                }
            });
        } else {
            res.status(500).send({error: 'missing data'});
        }

    } else {
        res.status(500).send({error: 'not permitted'});
    }

})

.get('/:name_customer', function(req, res, next) {
    const name_customer = req.params.name_customer ? req.params.name_customer : '';
    
    if(req.user){
        const customer = new Customer();
        customer.getCustomer({name_customer: name_customer, token: req.user.access_token}, db, function (response, error) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(500).send(error);
            }
        });
        
    }else{
        res.status(500).send(error);
    }

})

.delete('/:name_customer', function(req, res, next) {
    const name_customer = req.params.name_customer ? req.params.name_customer : '';
    
    if(req.user){
        const customer = new Customer();
        customer.deleteCustomer({name_customer: name_customer, token: req.user.access_token}, db, function (response, error) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(500).send(error);
            }
        });
        
    }else{
        res.status(500).send(error);
    }

})

