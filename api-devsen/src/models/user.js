import API_EXTRANET from "./api_extranet";

const config = process.env.NODE_ENV=='production' ? require("../config.production.json") : process.env.NODE_ENV=='staging' ? require("../config.staging.json") : require("../config.json");
import schemas  from './schemas.js';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {send_landingpage_data_to_akinda_email} from "../lib/util";
const UTIL = require("../lib/util");
var randtoken = require('rand-token');

var User = function (data={}, permissions, roles) {
    this.data = data;
    this.permissions = permissions;
    this.roles = roles;
};

User.prototype.data = {};
User.prototype.permissions = {};
User.prototype.roles = {};

User.prototype.get = function (field) {
    return this.data[field];
};

User.prototype.set = function (field, value) {
    this.data[field] = value;
};

/** //PROMISES DONE
 * add user
 * add user with role and send email - user this.data (username, email, signup_ip), this.roles
 *
 * @db - instance of database
 * @callback
 * @with_password - if not false, we need to verify the user by email | if false send recovery password email, the user can set the password by the email
 */
User.prototype.addUser = function (db, callback, with_password=true) {

    var self = this;
    var user = this.data;
    var roles = this.roles ? this.roles : [config.guest_role_id];

    var sql = 'SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = "users" AND table_schema = DATABASE();';
    db.query(sql, function (err, auto_increment) {
        if (!err) {
            //
        } else {
            if (callback) callback(false, err);
        }
        if (!(auto_increment && auto_increment.length > 0 && auto_increment[0].AUTO_INCREMENT)) {
            return;
        }
        const user_id = auto_increment[0].AUTO_INCREMENT;
        self.data.access_token = jwt.sign({id: user_id}, config.secret, {
            expiresIn: config.token_expires_seconds
        });

        const result = Joi.validate(user, schemas.user);

        if (!result.error) {
            user.username = user.email.substring(0, user.email.lastIndexOf("@"));
            user.password = bcrypt.hashSync(user.password, 8);
            user.code = UTIL.hexCode(config.activation_code_len);
            //var new_user = self.sanitize(user);
            var sql = 'INSERT INTO users (id, email, password, username, access_token, signup_ip, code, refresh_token, name, surname) VALUES (?,?,?,?,?,?,?,?,?,?);';
            db.query(sql, [user_id, user.email, user.password, user.username, user.access_token, user.signup_ip, user.code, user.refresh_token, user.name, user.surname], function (err, results) {
                if (err) {
                    if (err.errno == 1062) {
                        err = {'error': 'user already registered'};
                        //TODO - if not verified resend email verification else ?
                    }else if (err.errno == 1452) {
                        err = {'error': 'role not exists'};
                    }
                    if (callback) callback(false, err);
                }
                if (results) {
                    self.set('id', user_id);
                    self.add_roles(db, function(res, err){
                        if(err){
                            if(callback) callback(false, err);
                        }
                        if(res){
                            if(with_password){

                                UTIL.send_activation_email({email:user.email, username:user.username, store_name:"akinda", store_domain:"http://it.akinda.com", code:user.code, token:user.access_token, id:user_id, name:user.name, surname:user.surname, redirect_url:user.redirect_url,}, function(email_response){
                                    if(email_response){
                                        //var refresh_token = randtoken.uid(256);
                                        //TODO - save refresh_token in db
                                        var response_user = {"id": user_id, "token": user.access_token, /*email:user.email, "username":user.username, "refresh_token":user.refresh_token, name:user.name, surname:user.surname*/};
                                        if (callback) callback(response_user, false);
                                    }else{
                                        //TODO - ERROR INVIO EMAIL, MA UTENTE INSERITO IN DB GESTIRE ???
                                    }
                                });

                            }else{
                                //user created by akinda internal user
                                UTIL.send_recover_password_email({email:user.email, username:user.username, code:user.code, token:user.access_token, id:user_id, name:user.name, surname:user.surname}, function(email_response){
                                    if(email_response){
                                        //var refresh_token = randtoken.uid(256);
                                        //TODO - save refresh_token in db
                                        var response_user = {"id": user_id, "token": user.access_token,  /*email:user.email, "username":user.username, "refresh_token":user.refresh_token, name:user.name, surname:user.surname*/};
                                        if (callback) callback(response_user, false);
                                    }else{
                                        //TODO - ERROR INVIO EMAIL, MA UTENTE INSERITO IN DB GESTIRE ???
                                    }
                                });
                            }
                        }
                    });
                }
            });

        } else {
            if (callback) callback(false, result.error);
        }
    });
};

/**
 * get by id
 * get user by id
 *
 * @db - instance of database
 * @callback
 * @just_verified - id 1 get just the user verfied and active - if 0 get from all user
 */
User.prototype.get_by_id = function (db, callback, just_verified=true) {
    var id = this.data.id;
    var sql = "SELECT users.discipline, users.user_extended_id, users.type, users.verified, users.id, users.username, users.name, users.surname, users.phone, users.email, users.access_token, " +
        "users.phone, users.phone_2, users.fax, users.is_company, users.fiscal_code, users.vat, users.fiscal_code, users.ref_1, users.ref_2, users.ref_3, users.ref_3, users.ref_4, users.email_1, users.email_2, users.email_3, users.email_4, users.phone_number_1, users.phone_number_2, users.phone_number_3, users.phone_number_4, users.fk_resale_type as resale_type, billing_data.active as billing, billing_data.invoice_type, billing_data.country_code, " +
        "GROUP_CONCAT(users_roles.fk_id_role) as roles_id, " +
        "GROUP_CONCAT(roles.name) as roles_name, " +
        "GROUP_CONCAT(areas.employee) as areas_employee, " +
        "GROUP_CONCAT(areas.id) as areas_id, " +
        "GROUP_CONCAT(areas.name) as areas_name," +
        "GROUP_CONCAT(users_roles.fk_id_role) as roles " +
        "FROM users " +
        "INNER JOIN users_roles ON users_roles.fk_id_user = users.id " +
        "INNER JOIN roles ON users_roles.fk_id_role = roles.id " +
        "INNER JOIN areas ON areas.id = roles.fk_id_area " +
        "LEFT JOIN billing_data ON billing_data.fk_id_user = users.id " +
        "WHERE users.id = ? ";

    if(!just_verified) {
        sql = sql +"LIMIT 1;";
    }else{
        sql = sql +"AND users.verified=1 AND users.active=1 LIMIT 1;";
    }
    db.query(sql, [id], function (err, results) {
        if (err || !results || results.length<=0) {
            err = {'error':'not found'};
            if(callback) callback(false, err);
        } else if (results && results.length && results.length>0 && results[0].id) {
            results.forEach(function(v){
                if(!v.billing) v.billing = 0;
                if(v.roles) v.roles = v.roles.split(',').map(Number);
                if(v.roles){
                    const roles_id = v.roles_id.split(',');
                    const roles_name = v.roles_name.split(',');
                    const areas_id = v.areas_id.split(',');
                    const areas_name = v.areas_name.split(',');
                    const areas_employee = v.areas_employee.split(',');
                    roles_id.forEach(function(roles_id, key_role){
                        if(!v.roles_area) v.roles_area = [];
                        v.roles_area.push({
                            id:parseInt(roles_id,10),
                            name:roles_name[key_role],
                            area:{
                                id:parseInt(areas_id[key_role],10),
                                name:areas_name[key_role],
                                employee: parseInt(areas_employee[key_role],10),
                            },

                        })
                    });
                    delete v.roles_id;
                    delete v.roles_name;
                    delete v.areas_id;
                    delete v.areas_name;
                    delete v.areas_employee;
                }

            });
            if (callback) callback(results[0], false);
        }else{
            err = {'error':'not found'};
            if(callback) callback(false, err);
        }
    });
};


/**
 * check if user is employee
 * check if the requeeste id_user is an employee
 *
 * @id_user - id of user
 * @db - instance of database
 * @callback
 */
User.prototype.check_if_user_is_employee = function (id_user, db, callback) {
    var sql = "SELECT areas.employee FROM areas INNER JOIN roles ON roles.fk_id_area=areas.id INNER JOIN users_roles ON users_roles.fk_id_role = roles.id INNER JOIN users ON users_roles.fk_id_user = users.id WHERE users.id = ? LIMIT 1;";
    db.query(sql, [id_user], function (err, results) {
        if (err || !results || results.length<=0 ) {
            if(callback) callback(false, true);
        }else if (results && results.length && results.length>0 ) {
            if (callback) callback(results[0].employee==1 ? true : false, false);
        }
    });
};

/**
 * update email
 * update user email - user this.data (email, code, id, change_email) - JUST on user verified and active
 * add change_mail in db - the email needs verify
 *
 * @db - instance of database
 * @callback
 */
User.prototype.update_email = function (db, callback) {
    var self = this;
    var user = self.data;
    user.code = UTIL.hexCode(config.activation_code_len);
    const result = Joi.validate(user, schemas.user_logged);
    if (!result.error) {
        var sql = 'UPDATE users SET change_email = ? WHERE id = 1 AND active = 1 AND verified=1 AND 0 = IF(email = ?, 1, 0) LIMIT 1;';
        db.query(sql, [user.email, user.id, user.email], function (err, results) {


            if (err || !results) {
                err = {'error':'already registered'};
                if (callback) callback(false, err);
            } else if (results) {
                // user email updated
                UTIL.send_verify_change_email({email:user.email, username:user.username, code:user.code, token:user.access_token, id:user.id}, function(email_response){
                    if(email_response){
                        if (callback) callback(true, false);
                    }else{
                        // console.log('errore invio email');
                        //TODO - ERROR INVIO EMAIL, MA UTENTE INSERITO IN DB GESTIRE ???
                    }
                });
            }else{
                err = {'error':'unexpected error'};
                if (callback) callback(false, err);
            }
        });
    } else {
        if (callback) callback(false, result.error);
    }


};

/** //PROMISES DONE
 * get user by refresh token
 * get user by refresh token - use this.data (refresh_token, id) - refresh access_token
 * *
 * @db - instance of database
 * @callback
 */
User.prototype.get_token_by_refresh_token = function (db, callback) {
    var self = this;
    self.data.token = jwt.sign({id: self.data.id}, config.secret, {
        expiresIn: config.token_expires_seconds
    });
    var sql = 'UPDATE users SET access_token = ? WHERE refresh_token = ? AND id = ? LIMIT 1;';
    db.query(sql, [ self.data.token , self.data.refresh_token, self.data.id], function (err, results) {
        if (err || !results || results.affectedRows==0 || results.changedRows==0) {
            err = {'error':'get new token failed'};
            if (callback) callback(false, err);
        }
        if (results && results.affectedRows==1 && results.changedRows==1) {
            // user disabled
            if (callback) callback({token:self.data.token}, false);
        }
    });
};

User.prototype.get_token_by_id = function (db, callback) {
    var self = this;
    var sql = 'SELECT access_token FROM users WHERE id = ? LIMIT 1;';
    db.query(sql, [self.data.id], function (err, results) {
        if (err) {
            err = {'error':'get token failed'};
            if (callback) callback(err, false);
        } else if (results && results.length>0) {
            if (callback) callback(false, results);
        }
    });
};


/**   //PROMISES DONE
 * get user by email and password
 * get user by email and password - use this.data (email, password)
 * *
 * @db - instance of database
 * @callback
 */

User.prototype.get_by_email_password = function (db, callback) {
    var self = this;
    const password_plain = this.data.password;
    const email = this.data.email;
    var sql = "SELECT users.user_extended_id, users.verified, users.password, users.name, users.surname, users.phone, users.id, users.email, users.refresh_token, users.access_token, GROUP_CONCAT(users_roles.fk_id_role) as roles FROM users LEFT JOIN users_roles ON users_roles.fk_id_user = users.id WHERE users.email= ? AND users.active=1 AND users.verified=1 LIMIT 1;";
    db.query(sql, [email], function (err, results) {
        if (err || !results || results.length<=0 || !results[0] || !results[0]['id']) {
            err = {'error':'not found'};
            if(callback) callback(false, err);
        }
        if (results && results.length && results.length>0 && results[0]['id']) {
            // user founded
            if(bcrypt.compareSync(password_plain, results[0]['password'])){
                delete results[0]['password'];
                if (callback) callback(results[0], false);


                /*self.get_permissions(results, db, function(user, error){
                   if(!error) {
                       if (callback) callback(user, false);
                   }else{
                       error = {'error':'todo - error user/me'};
                       if (callback) callback(false, error);
                   }
                });*/


            }else{
                err = {'error':'no valid password'};
                if(callback) callback(false, err);
            }
        }else{
            //EMPTY RES
            //NEVER
        }
    });
};

/**  //PROMISES DONE
 * get user by email
 * get user by email - use this.data (email)
 * *
 * @db - instance of database
 * @callback
 */
User.prototype.get_by_email = function (db, callback) {
    var self = this;
    const email = this.data.email;
    var sql = "SELECT users.user_extended_id, users.password, users.id, users.email, users.refresh_token, users.access_token, users.code, users.username, GROUP_CONCAT(users_roles.fk_id_role) as roles FROM users LEFT JOIN users_roles ON users_roles.fk_id_user = users.id WHERE users.email = ? AND users.active=1 AND users.verified=1 LIMIT 1;";
    db.query(sql, [email], function (err, results) {
        if (err || !results || results.length<=0 || !results[0] || !results[0]['id']) {
            err = {'error':'not found'};
            if(callback) callback(err, false);
        }
        if (results && results.length && results.length>0 && results[0]['id']) {
            // user founded
            if (callback) callback(false, results[0]);
        }
    });
};


User.prototype.get_by_token_and_code_and_id = function (db, callback) {
    var self = this;
    const token = this.data.token;
    const code = this.data.code;
    const id = this.data.id;

    var sql = "SELECT users.user_extended_id, users.id FROM users WHERE users.access_token = ? AND users.code = ? AND users.id = ? LIMIT 1;";
    db.query(sql, [token, code, id], function (err, results) {
        if (err || !results || results.length<=0 || !results[0] || !results[0]['id']) {
            err = {'error':'not found'};
            if(callback) callback(err, false);
        }else {
            // user founded
            if (callback) callback(false, results[0]);
        }
    });
};

/**
 * send recovery password email
 * send email to user for recovery password - refresh access_token - user this.data (id)
 * - TODO - aggiornare anche refresh_token?
 *
 * @db - instance of database
 * @callback
 */
User.prototype.send_recovery_password = function (db, callback) {
    var self = this;
    self.get_by_email(db, function(err, res){
        if(!err) {
            self.data.id = res.id;
            //self.refresh_token(db, function (response, error) {
            //    if (!error) {
                    UTIL.send_recover_password_email({
                        email: res.email,
                        username: res.username,
                        code: res.code,
                        //token: self.data.token,
                        token:res.access_token,
                        id: res.id
                    }, function (email_response) {
                        if (email_response) {
                            var response_user = {"id": res.id, "username": res.username};
                            if (callback) callback(false, response_user);
                        } else {
                            //TODO - ERROR INVIO EMAIL
                        }
                    });
                //} else {
                //    if (callback) callback(true, false);
                //}
            //});
        }else{
            if (callback) callback(true, false);
        }

    }, true);
};

/**  //PROMISES DONE
 * refresh token
 * refresh access_token, last_login_ip user ad activate it - refresh code - use this.data (access_token, code, id) - JUST on user verified and active
 *
 * @db - instance of database
 * @callback
 * @refresh_both - refresh both token (refresh_token, access_token)
 */
User.prototype.refresh_token = function (db, callback, refresh_both) {
    var self = this;
    var new_token = jwt.sign({id: self.data.id}, config.secret, {
        expiresIn: config.token_expires_seconds
    });
    var refresh_token = jwt.sign({id: self.data.id}, config.secret, {
        expiresIn: config.refresh_token_expires_seconds
    });
    var id = self.data.id;
    var ip = self.data.last_login_ip;
    var sql = 'UPDATE users SET access_token = ?, last_login_ip = ? WHERE id = ? AND active = 1 AND verified=1 LIMIT 1; SELECT refresh_token FROM users WHERE id = 1 LIMIT 1;';
    var params = [new_token, ip];
    if(refresh_both){
        sql = 'UPDATE users SET access_token = ?, last_login_ip = ?, refresh_token = ? WHERE id = ? AND active = 1 AND verified=1 LIMIT 1';
        params.push(refresh_token);
    }else{
        params.push(id);
    }
    params.push(id);
    db.query(sql, params, function (err, results) {
        if (err) {
            err = {'error':'refreshing token failed'};
            if (callback) callback(false, err);
        }else if (results) {
            // user token updated
            var response_user = {"id": id, "token": new_token};
            if(refresh_both) {
                response_user.refresh_token = refresh_token;
            }else{
                response_user.refresh_token = results[1][0].refresh_token;
            }
            if (callback) callback(response_user, false);
        }
    });
}; //DO

/**
 * verify
 * verify user ad activate - refresh code - use this.data (access_token, code, id) - JUST on user not verified
 *
 * @db - instance of database
 * @callback
 */
User.prototype.verify = function (db, callback) {
    var self = this;
    var user = this.data;
    const new_code = UTIL.hexCode(config.activation_code_len);
    var sql = 'UPDATE users set verified=1, active=1, code=? WHERE access_token=? AND code=? AND id=? AND verified=0 LIMIT 1';
    db.query(sql, [new_code, user.access_token, user.code, user.id], function (err, results) {
        if (err || !results || results.affectedRows==0 || results.changedRows==0) {
            err = {};
            err = {'error':'activation failed'};
            if(callback) callback(false, err);
        }
        if (results && results.affectedRows==1 && results.changedRows==1) {
            // user verfied
            if(callback) callback(true, false);
        }
    });
};

/**
 * verify email
 * verify after change request and verify user - refresh code - use this.data (access_token, code, id)
 *
 * @db - instance of database
 * @callback
 */
User.prototype.verify_email = function (db, callback) {
    var self = this;
    var user = this.data;
    const new_code = UTIL.hexCode(config.activation_code_len);
    var sql = 'UPDATE users SET email = users.change_email, change_email = ?, verified=1, code=? WHERE access_token=? AND code=? AND id=? LIMIT 1';
    db.query(sql, ['', new_code, user.access_token, user.code, user.id], function (err, results) {
        if (err || !results || results.affectedRows==0 || results.changedRows==0) {
            err = {'error':'activation failed'};
            if(callback) callback(false, err);
        }
        if (results && results.affectedRows==1 && results.changedRows==1) {
            // user verfied
            if(callback) callback(true, false);
        }
    });
};

/**
 * update password
 * update user password where token, id, code and verify user - refresh code - use this.data (password, access_token, code, id)
 *
 * @db - instance of database
 * @callback
 */
User.prototype.updatePassword = function (db, callback) {
    var user = this.data;
    const new_code = UTIL.hexCode(config.activation_code_len);
    user.password = bcrypt.hashSync(user.password, 8);
    var sql = 'UPDATE users SET verified=1, code=?, password=? WHERE access_token=? AND code=? AND id=? LIMIT 1';
    db.query(sql, [new_code, user.password, user.token, user.code, user.id], function (err, results) {
        if (err || !results || results.affectedRows==0 || results.changedRows==0) {
            err = {'error':'update failed'};
            if(callback) callback(false, err);
        }
        if (results && results.affectedRows==1 && results.changedRows==1) {
            // user updated and verified
            if(callback) callback(true, false);
        }
    });
};

/**  //PROMISES DONE
 * add roles
 * add roles to user - use the current this.data (id) and this.roles
 *
 * @db - instance of database
 * @callback
 */
User.prototype.add_roles = function (db, callback){
    var user_id = this.data.id;
    var roles = this.roles;
    var params = [];
    var sql  = "INSERT INTO users_roles (fk_id_user, fk_id_role) VALUES ";
    for(var i=0; i<roles.length;i++){
        if(i>0) sql = sql + ',';
        sql = sql + '(?,?)';
        params.push(user_id);
        params.push(roles[i]);
    }

    db.query(sql, params, function (err, results) {
        if (err) {
            err = {'error': 'error in creating users_roles'};
            if (callback) callback(false, err);
        }
        if (results) {
            // users_roles created
            if (callback) callback(true, false);
        }
    });
};  //DO

/**
 * set roles
 * delete_roles AND add_roles - use the current this.data (id) and this.roles
 *
 * @db - instance of database
 * @callback
 * TODO - a che serve?
 */
User.prototype.set_roles = function (db, callback) {
    var self = this;
    self.delete_roles(db, function(res, err){
        if(res){
            self.add_roles(db, function(res, err){
                if(err){
                    if(callback) callback(false, err);
                }
                if(res){
                    if (callback) callback(true, false);
                }
            });
        }
    });
};

/**
 * delete roles
 * detach user roles - use the current this.data (id) and this.roles
 *
 * @db- instance of database
 * @callback
 */
User.prototype.delete_roles = function (db, callback) {
    var self = this;
    var id = self.data.id;
    var sql = 'DELETE FROM users_roles WHERE fk_id_user = ?;';
    db.query(sql, [id], function (err, results) {
        if (err) {
            err = {'error':'delete role failed'};
            if (callback) callback(false, err);
        }else if (results) {
            // deleted user roles
            if (callback) callback(true, false);
        }
    });
};

/**
 * switch active
 * set active or not active user
 *
 * @active - [0,1]
 * @db - instance of database
 * @callback
 */
User.prototype.switch_active = function (active, db, callback) {
    var self = this;
    var sql = 'UPDATE users SET active = ? WHERE id = ? LIMIT 1;';
    db.query(sql, [active, self.data.id], function (err, results) {
        if (err || !results || results.affectedRows==0 || results.changedRows==0) {
            err = {'error':'active/disable user failed'};
            if (callback) callback(false, err);
        }else if (results && results.affectedRows==1) {
            // user disabled
            if (callback) callback(active, false);
        }
    });
};




/**
 * add permissions
 * attach directly permissions to user by id - use the current this.permissions (id) {users_permissions_areas table}
 *
 * @id_user - id of user
 * @id_area - id of area
 * @db- instance of database
 * @callback
 */
User.prototype.add_permissions = function (id_user, id_area, db, callback) {
    var self = this;
    var permissions = this.permissions;
    var params = [];
    var sql = 'INSERT INTO users_permissions_areas (fk_id_user, fk_id_area, fk_id_permission) VALUES ';
    for(var i=0; i<permissions.length;i++){
        if(i>0) sql = sql + ',';
        sql = sql + '(?,?,?)';
        params.push(id_user);
        params.push(id_area);
        params.push(permissions[i]);
    }
    db.query(sql, params, function (err, results) {
        if (err) {
            if (err.errno == 1062) {
                err = {'error': 'permission/user/area already exists'};
            }else if (err.errno == 1452) {
                err = {'error': 'parent permission/user/area not exists'};
            }
            if (callback) callback(false, err);
        }
        if (results) {
            // permissions/users created
            if (callback) callback(true, false);
        }
    });
};

/**
 * delete direct user permissions
 *
 * @id_user - id of user
 * @id_permission - id of permission
 * @id_area - id of area
 * @db - instance of database
 * @callback
 */
User.prototype.delete_direct_user_permission = function (id_user, id_permission, id_area, db, callback) {
    var self = this;
    var id = self.data.id;
    var sql = 'DELETE FROM users_permissions_areas WHERE fk_id_user = ? AND fk_id_permission = ? AND fk_id_area = ? LIMIT 1;';
    db.query(sql, [id_user, id_permission, id_area], function (err, results) {
        if (err || !results || results.affectedRows==0) {
            err = {'error':'delete direct permission failed'};
            if (callback) callback(false, err);
        }else if (results) {
            // deleted user roles permissions
            if (callback) callback(true, false);
        }
    });
};

/**
 * get user permissions
 *
 * @id_user - id of user
 * @db- instance of database
 * @callback
 */
User.prototype.get_permissions = function (id_user, db, callback) {
    var self = this;
    var sql = 'SELECT users_permissions_areas.fk_id_permission as id, users_permissions_areas.fk_id_area as id_area, users_permissions_areas.fk_id_user as id_user, areas.name as area_name FROM users_permissions_areas INNER JOIN areas ON areas.id = users_permissions_areas.fk_id_area WHERE users_permissions_areas.fk_id_user = ?;';
    db.query(sql, [id_user], function (err, results) {
        if (err) {
            if (callback) callback(false, {error:'not found'});
        }else if (results) {
            // permissions/users retrived
            if (callback) callback(results, false);
        }
    });
};

/**
 * search users
 * search users by options
 *
 * @options - filters options of search (key, page, limit, sort=[db field], order=[asc,desc], employee=[0,1])
 * @db - instance of database
 * @callback
 */
User.prototype.search = function (options, db, callback) {
    var self = this;
    var user = self.data;
    var params = [];
    var query_employee = '';
    var query_guest = 'roles.code != "guest" AND ';
    if(options.employee>=0) query_employee = 'areas.employee = ? AND ';
    if(options.guest>=0) query_guest = 'roles.code = "guest" AND ';

    var sql = 'SELECT ' +
        '(SELECT COUNT(distinct users.id) as count FROM users INNER JOIN users_roles ON users_roles.fk_id_user = users.id INNER JOIN roles ON roles.id=users_roles.fk_id_role INNER JOIN areas ON areas.id = roles.fk_id_area WHERE '+query_employee+query_guest+options.filter+' LIKE ?) as count, ' +
        'users.id, users.signup_website, users.user_extended_id, users.discipline, users.type, users.username, users.email, users.creation_date, users.last_login_date, users.last_update_date, users.verified, users.active, users.name, users.surname,  ' +
        "users.phone, users.phone_2, users.fax, users.is_company, users.fiscal_code, users.vat, users.fiscal_code, users.ref_1, users.ref_2, users.ref_3, users.ref_3, users.ref_4, users.email_1, users.email_2, users.email_3, users.email_4, users.phone_number_1, users.phone_number_2, users.phone_number_3, users.phone_number_4, users.fk_resale_type as resale_type, billing_data.active as billing, billing_data.active as billing, billing_data.invoice_type as invoice_type, billing_data.country_code as country_code," +
        'GROUP_CONCAT(roles.code SEPARATOR ",") as roles_code, GROUP_CONCAT(roles.name SEPARATOR ",") as roles_name, GROUP_CONCAT(roles.id SEPARATOR ",") as roles_id, ' + //, GROUP_CONCAT(roles.name) as roles_name, GROUP_CONCAT(roles.id) as roles_id
        'GROUP_CONCAT(areas.name SEPARATOR ",") as areas_name, '+
        'GROUP_CONCAT(areas.id SEPARATOR ",") as areas_id '+
        'FROM users ' +
        'INNER JOIN users_roles ON users_roles.fk_id_user = users.id ' +
        'INNER JOIN roles ON roles.id = users_roles.fk_id_role ' +
        'INNER JOIN areas ON areas.id = roles.fk_id_area ' +
        'LEFT JOIN billing_data ON billing_data.fk_id_user = users.id '+
        'WHERE ' +query_employee +
        query_guest +
        ''+options.filter+' LIKE ? ' +
        'GROUP BY (users.email) ORDER BY '+options.sort+' '+options.order+' LIMIT ?,?;';
    if(options.employee>=0) params.push(options.employee);
    params.push('%'+options.key+'%');
    if(options.employee>=0) params.push(options.employee);
    params.push('%'+options.key+'%');
    params.push((options.page-1)*options.limit);
    params.push(options.limit);
    db.query(sql, params, function (err, results) {

        if (err) {
            err = {'error':'search users failed'};
            if (callback) callback(false, false, err);
        }
        if (results && !err) {
            // users search result
            var total_pages = results[0] && results[0]['count'] ? results[0]['count'] / options.limit : false;
            results.forEach(function(v){
                if(!v.billing) v.billing = 0;
                delete v.count;
                const roles_id = v.roles_id.split(',');
                const roles_name = v.roles_name.split(',');
                const roles_code = v.roles_code.split(',');
                const areas_id = v.areas_id.split(',');
                const areas_name = v.areas_name.split(',');
                roles_id.forEach(function(roles_id, key_role){
                    if(!v.roles_area) v.roles_area = [];
                    v.roles_area.push({
                        id:parseInt(roles_id,10),
                        name:roles_name[key_role],
                        code:roles_code[key_role],
                        area:{
                            id:parseInt(areas_id[key_role],10),
                            name:areas_name[key_role],
                        },

                    })
                });
                delete v.roles_id;
                delete v.roles_name;
                delete v.roles_code;
                delete v.areas_id;
                delete v.areas_name;
            });

            if (callback) callback(results,  Math.ceil(total_pages), false);
        }
    });
};


/**
 * get user store
 *
 * @id_user - id of user
 * @db - instance of database
 * @callback
 */
User.prototype.get_user_store = function (id_user, db, callback) {
    var self = this;
    var sql = 'SELECT stores_images.image, stores.id, stores.project_id, stores.code FROM users_stores ' +
        'INNER JOIN stores ON stores.id = users_stores.fk_id_store ' +
        'INNER JOIN stores_images ON stores.id = stores_images.fk_id_store WHERE users_stores.fk_id_user = ? and stores_images.type="logo" LIMIT 1;';
    db.query(sql, [id_user], function (err, results) {
        if (err) {
            if (callback) callback({error:'Unexpected error'}, false);
        }else if (results) {
            if(results && results.length>0){
                if (callback) callback(false, results);
            }else{
                if (callback) callback({error:'Not found'}, false);
            }
        }
    });
};


/**
 * get stac by user
 *
 * @id_user - id of user
 * @db - instance of database
 * @callback
    */
User.prototype.get_stack_by_user = function (data, db, callback, logger) {

    let self = this;
    let extranet = new API_EXTRANET();

    extranet.getStackByUser({token:data.token}, function(err, data) {
        if (!err) {
            // console.log("getStackByUser Success", data);
            if(callback) callback(false, data);
        }else{
            // console.log("getStackByUser Error", err);
            if(callback) callback({error:'Not Found'}, false);
        }
    }, logger);
};

User.prototype.get_coupon_by_user = function (data, db, callback, logger) {
    let extranet = new API_EXTRANET();
    extranet.getCouponByUser({token:data.token}, function(err, orders) {
        if (!err) {
            if(callback) callback(false, orders);
        }else{
            if(callback) callback({error:'Not Found'}, false);
        }
    }, logger);
};

User.prototype.create_coupon = function (data, db, callback, logger) {
    let extranet = new API_EXTRANET();

    // extranet.createCoupon({value:data.value, type: data.type, idProject: data.idProject, token:data.token}, function(err, result) {
    extranet.createCoupon(data, function(err, result) {
        if (!err) {
            if(callback) callback(false, result);
        }else{
            // if(callback) callback({error:'Not Found'}, false);
            if(callback) callback({error:err}, false);
        }
    }, logger);
};

User.prototype.get_api_token = function (data, db, callback, logger) {
    let extranet = new API_EXTRANET();
    extranet.getApiToken(data, function(err, result) {
        if (!err) {
            if(callback) callback(false, result);
        }else{
            // if(callback) callback({error:'Not Found'}, false);
            if(callback) callback({error:err}, false);
        }
    }, logger);
};

User.prototype.create_coupon_by_type = function (data, db, callback, logger) {
    let extranet = new API_EXTRANET();
    extranet.createCouponByType(data, function(err, result) {
        if (!err) {
            if(callback) callback(false, result);
        }else{
            // if(callback) callback({error:'Not Found'}, false);
            if(callback) callback({error:err}, false);
        }
    }, logger);
};

User.prototype.get_coupon_details = function (data, db, callback, logger) {
    let extranet = new API_EXTRANET();
    extranet.getCouponDetails(data, function(err, result) {
        if (!err) {
            if(callback) callback(false, result);
        }else{
            // if(callback) callback({error:'Not Found'}, false);
            if(callback) callback({error:err}, false);
        }
    }, logger);
};
User.prototype.send_landing_page_data_via_email = function (data, callback){
    UTIL.send_landingpage_data_to_akinda_email(data, function (email_response) {
        if (email_response) {
            let response_user = {"success": true};
            if (callback) callback(false, response_user);
        } else {
            if (callback) callback(true, false);
        }
    });
}


User.prototype.send_photoselfie_data_to_merchant_email = function (data, tipo, callback) {
    // destinatari = ['ernest.vila@akinda.ch','tidij11619@edultry.com'];

    if (tipo === 'M') {
        
        // const usernames = [];
        // // let destinatari = data.to;
        // data.to.forEach((email) => {
        //     usernames.push(email.substr(0, email.indexOf('@')));
        // })
        //
        // let username = usernames.join(", ");
        // data['username'] = username;
        // // console.log(data);

        let username = data.to.substr(0, data.to.indexOf('@'));
        data['username'] = username;
    } else {
        // console.log("referente");
        data['username'] = data.referente
    }

    // JUST FOR TEST
    // let response_user = {"success": true};
    // if (callback) callback(false, response_user);

    UTIL.send_photoselfie_data_to_merchant_email(data, function (email_response) {
        if (email_response) {
            let response_user = {"success": true};
            if (callback) callback(false, response_user);
        } else {
            if (callback) callback(true, false);
        }
    });
};

User.prototype.send_newsletter_registration_email = function (data, db, callback) {
    const username = data.user_email.substr(0, data.user_email.indexOf('@'));
    data['username'] = username;
    data['unsubscribe_url'] = config.unsubscribe_url;
    UTIL.send_newsletter_coupon(data, function (email_response) {
        if (email_response) {
            let response_user = {"success": true};
            if (callback) callback(false, response_user);
        } else {
            // if (callback) callback(true, false);
            if (callback) callback(true, email_response);
        }
    });
};

// User.prototype.send_photoselfie_data_to_merchant_email_old = function (data, tipo, callback) {
//     // destinatari = ['ernest.vila@akinda.ch','tidij11619@edultry.com'];
//
//     if(tipo === 'M'){
//         console.log("merchant");
//         const usernames = [];
//         // let destinatari = data.to;
//         data.to.forEach((email) => {
//             usernames.push(email.substr(0, email.indexOf('@')));
//         })
//
//         let username = usernames.join(", ");
//         data['username'] = username;
//         // console.log(data);
//     }else{
//         console.log("referente");
//         data['username'] = data.referente
//     }
//
//
//     // JUST FOR TEST
//     // let response_user = {"success": true};
//     // if (callback) callback(false, response_user);
//
//
//     UTIL.send_photoselfie_data_to_merchant_email(data, function (email_response) {
//         if (email_response) {
//             let response_user = {"success": true};
//             if (callback) callback(false, response_user);
//         } else {
//             if (callback) callback(true, false);
//         }
//     });
// };

// User.prototype.send_photoselfie_data_to_referent_email = function (data, callback) {
//     data['username'] = data.referente;
//
//     // JUST FOR TEST
//     // let response_user = {"success": true};
//     // if (callback) callback(false, response_user);
//
//     UTIL.send_photoselfie_data_to_merchant_email(data, function (email_response) {
//         if (email_response) {
//             let response_user = {"success": true};
//             if (callback) callback(false, response_user);
//         } else {
//             if (callback) callback(true, false);
//         }
//     });
// };

// User.prototype.send_newsletter_registration_email_old = function (data, db, callback) {
//     let self = this;
//     self.get_by_email(db, function (err, res) {
//         if (!err) {
//             self.data.id = res.id;
//             data['username'] = res.username;
//             UTIL.send_newsletter_coupon(data, function (email_response) {
//                 if (email_response) {
//                     let response_user = {"success": true};
//                     if (callback) callback(false, response_user);
//                 } else {
//                     //TODO - ERROR INVIO EMAIL
//                     res.status(401).send('error sending email');
//                 }
//             });
//         } else {
//             // if (callback) callback(true, false);
//             if (callback) callback(err, false);
//         }
//     }, true);
// };

module.exports = User;
