/* eslint-disable no-redeclare,no-empty */
import resource from 'resource-router-middleware';
import User from '../models/user';
import Role from '../models/role';
import Permission from '../models/permission';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import schemas from "../models/schemas";

import User_r from '../models/user_r';
// import Store from "../models/store";
// import API_EXTRANET from "../models/api_extranet";

let checkVAT = require('validate-vat');
const path = require("path");
let error = {"error":"not permitted"};
const UTIL = require("../lib/util");
const randtoken = require('rand-token');

export default ({ config, db, logger, }) => resource({

    /** Property name to store preloaded entity on `request`. */
    id : 'users',

})
    .post('/signup', function(req, res, next) { // TODO -- manage_employee | refactoring

    const password = req.body.password ? req.body.password : '';
    let roles = [config.guest_role_id];
    const ip = UTIL.get_client_ip(req);
    const refresh_token = randtoken.uid(256);
    const redirect_url = req.body.redirect_url ? req.body.redirect_url : null;
    const url = require('url');
    const referer = url.parse(req.headers.referer).hostname;
    let user_to_add = {referer:referer, email: req.body.email, password:password, signup_ip:ip, refresh_token:refresh_token, name:req.body.name, surname:req.body.surname, redirect_url:redirect_url, roles:roles};
    let origin_domain = req.get('origin');


    //if(! user_to_add.email ) return res.status(500).send({error:"no valid email"});
    if(req.user){
        try {
            roles = req.body.roles.split(',').map( Number );
        }catch (e) {
            //skip
        }
        user_to_add.roles = roles;
        const permissions = new Permission(req.user);
        permissions.get_permission('create_user', db, function(permission, err){
            if(err){
                res.status(401).send(error);
                return;
            }
            if(permission){
                const role = new Role();
                role.check_if_roles_are_employee(roles, db, function (is_employee, err) {
                    if(err){
                        res.status(500).send({ error: [ {context:{key: 'role' } } ]});
                        return;
                    }
                    if(is_employee){
                        // check if the req.user has the permissions
                        permissions.get_permission('manage_employee', db, function(permission, err) {
                            if (!err) {
                                let user_to_add = {referer:referer, email: req.body.email, password:password, signup_ip:ip, refresh_token:refresh_token, name:req.body.name, surname:req.body.surname, redirect_url:redirect_url, roles: roles};
                                user_to_add.discipline = "";
                                user_to_add.type = "";
                                User_r.add(user_to_add, false)
                                    .then((user) => {
                                        if(user.password) delete user['password'];
                                        if(user.code)  delete user['code'];
                                        res.status(200).send(user);

                                    }).catch((err) => {
                                    console.error(err);
                                    res.status(500).send(err);

                                });
                            }else{
                                // the req.user not has the permission
                                res.status(401).send(error);

                            }
                        });

                    }else{
                        res.status(500).send({error:true});
                    }
                });
            }
        });

    }else if(!req.user){ //signup new user
        user_to_add.discipline = "";
        user_to_add.type = "";
        user_to_add.welcome = req.body.welcome;
        user_to_add.thanks = req.body.thanks;
        user_to_add.thank = req.body.thank;
        user_to_add.confirm = req.body.confirm;
        user_to_add.click = req.body.click;
        user_to_add.activate = req.body.activate;
        user_to_add.hello = req.body.hello;
        user_to_add.confirm_account = req.body.confirm_account;
        User_r.add(user_to_add, true)
            .then((user) => {
                if(user.password) delete user['password'];
                if(user.code)  delete user['code'];
                res.status(200).send(user);

            }).catch((err) => {
            console.error(err);
            res.status(500).send(err);

        });
    }else{
        res.status(500).send(error);
    }
})
    
.post('/add', function(req, res, next) {
        var roles = [];
        var discipline = "";
        if(req.user){
            try {
                roles = req.body.roles.split(',').map( Number );
                roles = roles.filter((e)=> e>0);
            }catch (e) {

            }
            try {
                if(req.body.discipline)
                    discipline = req.body.discipline.split(',').map( String );
            }catch (e) {

            }
            var user_to_add = req.body;
            user_to_add.roles_id = roles;
            delete user_to_add.roles;
            user_to_add.discipline = discipline;

            const result = Joi.validate(user_to_add, schemas.new_user, {abortEarly: false});
            if (!result.error) {
                const permissions = new Permission(req.user);
                permissions.get_permission('create_user', db, function(permission, err){
                    if(err){
                        res.status(401).send(error);
                        return;
                    }
                    if(permission){
                        const role = new Role();
                        role.check_if_roles_are_employee(roles, db, function (is_employee, err) {
                            if(err){
                                res.status(500).send(error);
                                return;
                            }else if(is_employee){
                                res.status(401).send(error);
                                return;
                            }else{
                                if(discipline) user_to_add.discipline = user_to_add.discipline.toString();
                                User_r.addNewUser(user_to_add, false)
                                    .then((user) => {
                                        if(user.password) delete user['password'];
                                        if(user.code)  delete user['code'];
                                        res.status(200).send(user);
                                    }).catch((err) => {
                                        console.error(err);
                                        res.status(500).send(err);
                                    });
                            }
                        });
                    }
                });
            }else{
                res.status(401).send({error:result.error.details});
            }

        }else{
            res.status(401).send(error);

        }

})

.get('/me/:permissions', function(req, res) { //get user profile

    res.status(500).send('not implemented');
    

})

.get('/get/:id', function(req, res) { //get user profile py id

    if(req.user){
        var user_to_get = req.params.id;
        const permissions = new Permission(req.user);
        permissions.get_permission('list_users', db, function(permission, err, user_to_get){
            if(user_to_get && 'access_token' in user_to_get) delete user_to_get.access_token;
            if(user_to_get && 'roles' in user_to_get) delete user_to_get.roles;
            if(err && !user_to_get){
                res.status(404).send({error:'not found'});
            }else if(err){
                res.status(401).send(err);
            }else if(user_to_get){
                res.status(200).send(user_to_get);
            }else{
                res.status(500).send({error:'Unexpected error'});

            }
        }, user_to_get, true);

    }else{
        res.status(401).send(error);

    }

})

    .post('/login', function(req, res) { //post login and get token (refreshed)

        
            User_r.getByEmailAndPassword({email:req.body.email, password:req.body.password})
                .then((user) => {
                    const ip = UTIL.get_client_ip(req);
                    

                    if(user.password) delete user['password'];
                    if(user.code)  delete user['code'];
                    jwt.verify(user.access_token, config.secret, function(err, decoded) {
                        if(user.access_token){
                            user.token = user.access_token;
                        }
                        if(err){
                            User_r.refreshToken(user, false).then((user)=>{
                                if(user.access_token) delete user['access_token'];
                                res.status(200).send(user);

                            }).catch((err) => {
                                console.error(err);
                                res.status(500).send(err);
                            });
                        } else if(!err && decoded && decoded.id){
                            var millis = ((decoded.exp*1000) - Date.now()); // time to expire
                            if(millis>0){
                                if(user.access_token) delete user['access_token'];
                                res.status(200).send(user);
                            }else{
                                // upddate access token
                                User_r.refreshToken(user, false).then((user)=>{
                                    if(user.access_token) delete user['access_token'];
                                    res.status(200).send(user);

                                }).catch((err) => {
                                    console.error(err);
                                    res.status(500).send(err);
                                });
                            }
                        }
                    });
                }).catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
        
    })
   
.post('/token', function(req, res) { //get user profile py id

        res.status(500).send({error:'disabled function'});
   
})
    
.get('/logout', function(req, res) { // url sent via email


    //refactoring
    User_r.refreshToken({id:req.user.id}, false).then((user)=>{
        res.status(200).send({logout:true});

    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);

    })

})
.get('/verify', function(req, res) { //verify user (HTML PAGE)

    

});
   
const decipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}