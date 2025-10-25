/* eslint-disable no-undef */
//'use strict';

import * as randtoken from "rand-token";

const config = process.env.NODE_ENV == 'production' ? require("../config.production.json") : process.env.NODE_ENV == 'staging' ? require("../config.staging.json") : require("../config.json");
import db           from '../db_r';
import jwt          from "jsonwebtoken";
import schemas      from "./schemas";
import Joi          from "joi";
import API_EXTRANET from "./api_extranet";

const UTIL = require("../lib/util");
var md5 = require('md5');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNT = require('google-libphonenumber').PhoneNumberType;

class User {
    constructor(userData) {
        this.id = userData.id;
        this.email = userData.email;
        this.username = userData.username;
        this.name = userData.name;
        this.surname = userData.surname;
        this.phone = userData.phone;
        this.token = userData.access_token;
        this.refresh_token = userData.refresh_roken;
        this.roles = userData.roles;
        this.code = userData.code;
        this.verified = userData.verified;
    }
}

/**
 * get user by email and password
 * @user = {email, password}
 *
 */
exports.getByEmailAndPassword = ((user) => {
    return new Promise((resolve, reject) => {
        db.getUserByEmailAndPassword(user)
            .then((userData) => {
                // user founded
                const pwd_splitted = userData.password.split(':');
                const pwd_width_salt = md5(user.password + pwd_splitted[1]) + ':' + pwd_splitted[1];
                if (pwd_width_salt === userData.password) {
                    delete userData['password'];
                    //let user = new User (userData);
                    resolve(userData);
                } else {
                    reject({'error': 'no valid password'});
                }
                /*if(md5(user.password)===userData.password){
                    delete userData['password'];
                    let user = new User (userData);
                    resolve (userData);
                }else{
                    reject({'error':'no valid password'});
                }*/

            }).catch((err) => {
            reject(err);
        });
    });
});


exports.getSuperUserByEmail = ((user) => {
    return new Promise((resolve, reject) => {
        db.getUserDataByEmail(user)
            .then((userData) => {
                // user founded
                // const pwd_splitted = userData.password.split(':');
                // const pwd_width_salt = md5(user.password + pwd_splitted[1]) + ':' + pwd_splitted[1];
                // if (pwd_width_salt === userData.password) {
                //     delete userData['password'];
                //     //let user = new User (userData);
                //     resolve(userData);
                // } else {
                //     reject({'error': 'no valid password'});
                // }

                resolve(userData);

            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * refresh user access_token
 * @user = {id, email, password, last_login_ip}
 * @refresh_both_tokens - bool, true update both token:  access_token and refresh_token
 *
 */
exports.refreshToken = ((user, refresh_both_tokens) => {
    return new Promise((resolve, reject) => {
        user.token = jwt.sign({id: user.id}, config.secret, {
            expiresIn: config.token_expires_seconds
        });
        if (refresh_both_tokens) {
            user.refresh_token = jwt.sign({id: user.id}, config.secret, {
                expiresIn: config.refresh_token_expires_seconds
            });
        }

        db.userRefreshToken(user, refresh_both_tokens)
            .then((userData) => {
                if (userData && userData.success)
                    user.refresh_token = userData.refresh_token;
                resolve(user);
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * add user
 * @user = {email, password}
 *
 */
exports.add = ((user, with_password_email) => {
    return new Promise((resolve, reject) => {
        let roles = user.roles ? user.roles : [config.guest_role_id];
        delete user.roles;
        const result = Joi.validate(user, schemas.user);
        if (!result.error) {
            user.username = user.email.substring(0, user.email.lastIndexOf("@"));
            const salt = randtoken.uid(32);
            user.password = md5(user.password + salt) + ':' + salt;
            user.code = UTIL.hexCode(config.activation_code_len);

            db.addUser(user)
                .then((userData) => {
                    if (userData && userData.success) {
                        user = userData.response;
                        db.addUserRoles(user, roles)
                            .then((roles_are_created) => {
                                if (with_password_email) {
                                    UTIL.send_activation_email({
                                        email: user.email,
                                        username: user.username,
                                        store_name: "akinda",
                                        store_domain: "http://it.akinda.com",
                                        code: user.code,
                                        token: user.token,
                                        id: user.id,
                                        name: user.name,
                                        surname: user.surname,
                                        redirect_url: user.redirect_url
                                        ,
                                        welcome: user.welcome,
                                        thanks: user.thanks,
                                        thank: user.thank,
                                        activate: user.activate,
                                        click: user.click,
                                        confirm: user.confirm,
                                        hello: user.hello,
                                        confirm_account: user.confirm_account
                                    }, function (email_response) {
                                        if (email_response) {
                                            //var refresh_token = randtoken.uid(256);
                                            //TODO - save refresh_token in db
                                            resolve({id: user.id, token: user.token});
                                        } else {
                                            //TODO - ERROR INVIO EMAIL, MA UTENTE INSERITO IN DB GESTIRE ???
                                        }
                                    });
                                } else {
                                    //user created by akinda internal user
                                    UTIL.send_recover_password_email({
                                        email: user.email,
                                        username: user.username,
                                        code: user.code,
                                        token: user.token,
                                        id: user.id,
                                        name: user.name,
                                        surname: user.surname,
                                        store_name: "akinda",
                                        store_domain: "http://it.akinda.com"
                                    }, function (email_response) {
                                        if (email_response) {
                                            //var refresh_token = randtoken.uid(256);
                                            //TODO - save refresh_token in db
                                            resolve({id: user.id, token: user.token});
                                        } else {
                                            //TODO - ERROR INVIO EMAIL, MA UTENTE INSERITO IN DB GESTIRE ???
                                        }
                                    });
                                }
                            }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        console.error({error: "unexpected", code: 1});
                        resolve({error: "unexpected", code: 1});
                    }

                }).catch((err) => {
                reject(err);
            });
        } else {
            reject({error: result.error.details});
        }
    });
});


/**
 * add new guest user
 * @user = {name, email, roles}
 *
 */
exports.addNewUser = ((user) => {
    return new Promise((resolve, reject) => {
        const salt = randtoken.uid(32);
        if (!user.email || !user.email.trim()) {
            user.email = randtoken.uid(25) + config.no_user_email;
        }
        user.username = user.email.substring(0, user.email.lastIndexOf("@"));
        user.signup_ip = "::1";
        user.surname = '';
        user.password = md5(user.password + salt) + ':' + salt;
        user.refresh_token = randtoken.uid(256);
        user.code = UTIL.hexCode(config.activation_code_len);
        user.verified = 1;
        db.addUser(user).then((userData) => {
            if (userData && userData.success) {
                user = userData.response;
                db.addUserRoles(user, user.roles_id).then((roles_are_created) => {
                    if (user.roles_id.includes(config.id_role_merchant)) {
                        UTIL.send_recover_password_email({
                            email: user.email,
                            username: user.username,
                            code: user.code,
                            token: user.token,
                            id: user.id,
                            name: user.name,
                            surname: user.surname,
                            store_name: "akinda",
                            store_domain: "http://it.akinda.com"
                        }, function (email_response) {
                            if (email_response) {
                                resolve(user);
                            } else {
                                resolve(user);
                            }
                        });
                    } else {
                        resolve(user);
                    }
                }).catch((err) => {
                    reject(err);
                });
            } else {
                console.error({error: "unexpected", code: 1});
                resolve({error: "unexpected", code: 1});
            }

        }).catch((err) => {
            reject(err);
        });

    });
});

/**
 * get New Token By Refresh User Token
 * @user = {id, refresh_token}
 *
 */
exports.getNewTokenByRefreshToken = ((user) => {
    return new Promise((resolve, reject) => {
        db.userGetNewTokenByRefreshToken(user)
            .then((userData) => {
                if (userData && userData.success)
                    resolve(userData.response);
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * update password
 * @user = {id, code, password}
 *
 */
exports.updatePassword = ((user) => {
    return new Promise((resolve, reject) => {
        user.new_code = UTIL.hexCode(config.activation_code_len);
        const salt = randtoken.uid(32);
        user.password = md5(user.password + salt) + ':' + salt;
        db.userUpdatePassword(user)
            .then((userData) => {
                if (userData && userData.success)
                    resolve(true);
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * update phone
 * @user = {id, phone}
 *
 */
exports.updatePhone = ((user) => {
    return new Promise((resolve, reject) => {
        db.userUpdatePhone(user)
            .then((userData) => {
                if (userData && userData.success) {
                    var extranet = new API_EXTRANET();
                    extranet.updateUser({user_id: user.id, token: user.token}, function (result, err) {
                        if (!err) {
                            resolve(true);
                        } else {
                            reject(err);
                        }
                    }, false);
                } else {
                    reject(false);
                }
            }).catch((err) => {
            reject(err);
        });
    });
});


/**
 * get By user Token And user Code And user Id
 * @user = {id, token, code}
 *
 */
exports.getByTokenAndCodeAndId = ((user) => {
    return new Promise((resolve, reject) => {
        db.userGetByTokenAndCodeAndId(user)
            .then((userData) => {
                if (userData && userData.success)
                    resolve(userData.response);
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * get By user Token And user Code And user Id
 * @user = {id, token, code}
 *
 */
exports.sendRecoveryPassword = ((user) => {
    return new Promise((resolve, reject) => {
        /*db.userGetByTokenAndCodeAndId(user)
            .then((userData)=>{
                if(userData && userData.success)
                    resolve (userData.response);
            }).catch((err) => {
            reject(err);
        });*/
        db.userGetByEmailAll(user)
            .then((userData) => {
                if (userData.success) {
                    userData.response.store_name = "akinda";
                    userData.response.store_domain = "http://it.akinda.com";
                    userData.response.hello = user.hello;
                    userData.response.thank = user.thank;
                    userData.response.update = user.update;
                    userData.response.click = user.click;
                    userData.response.modify_click = user.modify_click;
                    userData.response.modify = user.modify;
                    UTIL.send_recover_password_email(userData.response, function (email_response) {
                        if (email_response) {
                            var response_user = {"id": userData.id, "username": userData.username};
                            resolve({success: true});
                        } else {
                            reject({error: "send mail"});
                        }
                    });
                } else {
                    reject({error: "not found"});
                }
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * update user email
 * JUST on user verified and active
 * add change_mail in db - the email needs verify
 *
 * @user = {email, id, new_email}
 *
 *
 */
exports.updateEmail = ((user, data) => {

    return new Promise((resolve, reject) => {
        //user.code = UTIL.hexCode(config.activation_code_len);
        // const result = Joi.validate(user, schemas.user_logged);
        // if (!result.error) {
            db.userAddChangeEmailRequest(user, data.new_email).then((response) => {
                if (response.success) {
                    // user email updated
                    user.email = data.new_email;

                    user.store_name = "akinda";
                    user.store_domain = "http://it.akinda.com";
                    user.token = user.access_token;

                    const translations = {
                        welcome: data.welcome,
                        modify: data.modify,
                        update: data.update,
                        thank: data.thank,
                        modify_click: data.modify_click,
                        hello: data.hello,
                    };


                    UTIL.send_verify_change_email(user, translations, function (email_response) {
                        if (email_response) {
                            resolve({success: true});
                        } else {
                            reject({error: "send email"});
                        }
                    });
                } else {
                    reject({error: "not found"});
                }
            }).catch((err) => {
                reject(err);
            });
        // } else {
        //     reject(result.error.details);
        // }
    });
});


/**
 * vrerify and activate user
 * @user = {id, code, token}
 *
 */
exports.verify = ((user) => {
    return new Promise((resolve, reject) => {
        user.new_code = UTIL.hexCode(config.activation_code_len);
        db.userVerify(user)
            .then((userData) => {
                if (userData && userData.success)
                    resolve(true);
            }).catch((err) => {
            reject(err);
        });
    });
});


/**
 * verify user changed email
 * @user = {id, code, token}
 *
 */
exports.verifyEmail = ((user) => {
    return new Promise((resolve, reject) => {
        user.new_code = UTIL.hexCode(config.activation_code_len);
        db.userVerifyEmail(user)
            .then((userData) => {
                if (userData && userData.success)
                    resolve(true);
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * verify if user is registered to newslatter
 * @user = {email}
 *
 */
exports.checkNewsletterRegistration = ((user_email) => {
    return new Promise((resolve, reject) => {
        db.checkNewsletterEmail(user_email)
            .then((userData) => {
                if (userData && userData.success) {
                    resolve(userData);
                } else if (userData && !userData.success) {
                    resolve(userData);
                } else {
                    reject({error: "not found"});
                }
            }).catch((err) => {
            reject(err);
        });
    });
});

/**
 * register user to Newslatter
 * @user = {email}
 *
 */
exports.registerUserToNewsletter = ((user_email, source_registration, project_id) => {
    return new Promise((resolve, reject) => {
        db.registerEmailToNewsletter(user_email, source_registration, project_id)
            .then((userData) => {
                if (userData.success)
                    resolve(true);
            })
            .catch((err) => {
                reject(err);
            });
    });
});


/**
 * unsubscribe user from Newslatter
 * @user = {email}
 *
 */
exports.unsubscribeUserFromNewsletter = ((user_email) => {
    return new Promise((resolve, reject) => {
        db.unsubscribeEmailFromNewsletter(user_email)
            .then((userData) => {
                if (userData.success)
                    resolve(true);
            })
            .catch((err) => {
                reject(err);
            });
    });
});

/**
 * get user store
 * @user = {id}
 *
 */
exports.getMyStore = ((user) => {
    return new Promise((resolve, reject) => {
        db.userGetMyStore(user)
            .then((store) => {
                // user founded

                if (store && store.success) {
                    resolve(store)
                } else {
                    reject({error: "not found"});
                }

            }).catch((err) => {
            reject(err);
        });
    });
});

exports.update = ((user) => {
    return new Promise((resolve, reject) => {
        const token = user.token;
        delete user.token;
        if (user.resale_type) {
            user.fk_resale_type = user.resale_type;
            delete user.resale_type;
        }
        db.userUpdate(user)
            .then((userData) => {
                if (userData && userData.success) {
                    var extranet = new API_EXTRANET();
                    extranet.updateUser({user_id: user.id, token: token}, function (result, err) {
                        if (!err) {
                            resolve(true);
                        } else {
                            reject(err);
                        }
                    }, false);
                } else {
                    reject(false);
                }
            }).catch((err) => {
            reject(err);
        });
    });
});


/*exports.delete = ((user) => {
    return new Promise ((resolve, reject) => {
        db.delete(user)
            .then((deleted)=>{
                if(deleted && deleted.success)
                    resolve (true);
            }).catch((err) => {
            reject(err);
        });
    });
});*/


exports.getByUserExtendedId = ((user) => {
    return new Promise((resolve, reject) => {
        db.userGetByUserExtendedId(user)
            .then((userData) => {
                if (userData && userData.success)
                    resolve(userData.response);
                else
                    reject({error: "Not found"});
            }).catch((err) => {
            reject(err);
        });
    });
});


/**
 * get By user Token And user Code And user Id
 * @user = {id, token, code}
 *
 */
exports.getPhoneNumbersById = ((user) => {
    return new Promise((resolve, reject) => {
        db.userGetPhoneNumbersById(user)
            .then((userData) => {
                if (userData && userData.success) {
                    const all_numbers = [];
                    userData.response.forEach((phone) => {
                        Object.keys(phone).forEach((key) => {
                            if (phone[key]) {
                                all_numbers.push({number: phone[key], type: key});
                            }
                        });
                    });
                    const mobile_numbers = UTIL.filterPhoneNumbers(all_numbers, 'MOBILE');
                    resolve(mobile_numbers);
                } else {
                    reject({err: "Unexpected"})
                }
            }).catch((err) => {
            reject(err);
        });
    });
});


exports.getMerchantStoreData = ((user) => {
    return new Promise((resolve, reject) => {
        db.getMerchantStoreData_by_email(user)
            .then((merchant_store_data) => {
                // merchat store data founded
                // console.log("MERCHANT STORE DATA", merchant_store_data)
                resolve(merchant_store_data);
            }).catch((err) => {
            reject(err);
        });
    });
});