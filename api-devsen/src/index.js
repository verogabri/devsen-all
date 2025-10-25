const config = process.env.NODE_ENV==='production' ? require("./config.production.json") : process.env.NODE_ENV==='staging' ? require("./config.staging.json") : require("./config.json");

import "babel-polyfill";

import express from 'express';
import cors from 'cors';

import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import _ from 'underscore';
import compression from 'compression';
//import rfs from 'rotating-file-stream';
import winston from 'winston';
import path from 'path';
const DailyRotateFile = require('winston-daily-rotate-file');
var fs = require('fs');
var helmet = require('helmet');
const nocache = require('nocache');
const nosniff = require('dont-sniff-mimetype');
const frameguard = require('frameguard');
const xssFilter = require('x-xss-protection');
const ienoopen = require('ienoopen');
var hsts = require('hsts');

const hpkp = require('hpkp');
const csrf = require('csurf');

const app = express();



app.use(helmet());
app.disable('x-powered-by');
app.use(nosniff());
app.use(frameguard({ action: 'deny' }))
app.use(xssFilter({ setOnOldIE: true }))
app.use(ienoopen());
app.use(hsts({
    maxAge: 15552000  // 180 days in seconds
}));

 
//** CUSTOM CONTROLLED LOG **/
var logDirectory = path.join(__dirname, 'log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


const logger = winston.createLogger({
    format: winston.format.json(),
    level: 'debug',
    transports: [
        new DailyRotateFile({
                filename: 'custom-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '1d',
                dirname: logDirectory,
            }
        ),
    ]
});



logger.on('rotate', function(oldFilename, newFilename) {
    fs.unlinkSync(oldFilename);
});


/* function to trim all params in body */
var trimmer = function(req, res, next){
  req.body = _.object(_.map(req.body, function (value, key) {
      if(typeof value ==="string"){
          return [key, value.trim()];
      }
      return [key, value];
  }));
  next();
};

app.use(compression());



app.use(cors({
	exposedHeaders: config.corsHeaders
}));


// ##############################
// // // FIXING PAYLOAD TOO LARGE
// #############################
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(trimmer);

// connect to db
initializeDb( (db) => {
    // console.log(pb_db);

    // internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/', api({ config, db, logger }));


    app.listen(process.env.PORT || config.port, () => {
        console.log(`Started on port ${config.port}`);
    });

});


app.use(express.urlencoded({ extended: true }));

export default app;
