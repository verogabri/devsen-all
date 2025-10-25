import { version } from '../../package.json';
import { Router } from 'express';
// import users from './users';
import orders from './orders';
import customers from './customers';

// const config = process.env.NODE_ENV=='production' ? require("../config.production.json") : process.env.NODE_ENV=='staging' ? require("../config.staging.json") : require("../config.json");
// const config =  require("../config.json");


export default ({ config, db, logger }) => {

	console.log("Starting router...");
	let api = Router();

    logger.log({
        level: 'debug',
        message: 'start api'
    });

	// info version
	api.use('/version', (req, res) => {
		res.json({ version });
	});

	// info health check
	api.use('/health-check', (req, res) => {
		res.status(200).send({'health-check':true});
	});

	
	api.use('/customers', customers({ config, db, logger}));
	api.use('/orders', orders({ config, db, logger}));
    // api.use('/user', users({ config, db, logger}));
    

    // perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.end();
	});

	return api;
}
