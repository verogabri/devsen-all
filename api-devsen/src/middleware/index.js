import { Router } from 'express';
import jwt from "jsonwebtoken";
// import User from '../models/user';

export default ({ config, db, ps_db }) => {
	let routes = Router();

    routes.use(function(req, res, next) {

        const token = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ','') : false; //get token from request headers
        if(!token){
            req.user = false; //no user logged with token
            next();
        }else{
            if(token==config.admin_token){ // admin token no expired
                req.user = {admin:true};
                next();
            }else{
                
                // per adesso lascio fisso l'admin vero
                req.user = {admin:true};
                next();

                /* controllo da definire meglio 
                jwt.verify(token, config.secret, function(err, decoded) {
                    if (err) return res.status(401).send({ auth: false, message: err.name });
                    if(!err && decoded && decoded.id){
                        var millis = ((decoded.exp*1000) - Date.now()); // time to expire
                        if(millis>0){
                            var user = new User({id:decoded.id});
                            user.get_by_id(db, function(response, error){
                                if(!error){
                                    if(response.access_token==token){
                                        req.user = response;
                                        next();
                                    }else{
                                        res.status(401).send({auth:false, message:'token-expired'}); // token expired return 401

                                    }
                                }else{
                                    res.status(401).send({auth:false, message:'not-permitted'}); // token expired return 401
                                    //req.user = false; // no user with requested token
                                    //next();

                                }
                            }, true);
                        }else{
                            // token expired
                            
                            //req.user = false;
                            //next();
                            res.status(401).send({auth:false, message:'token-expired'}); // token expired return 401

                        }
                    }
                });
                */
               
            }
        }
    });

    // TODO - check
    routes.use(function(err, req, res, next) {
        console.log(err);
        res.status(500).send('500 page');

    });

    return routes;
}
