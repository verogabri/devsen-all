const config = process.env.NODE_ENV=='production' ? require("./config.production.json") : process.env.NODE_ENV=='staging' ? require("./config.staging.json") : require("./config.json");


export default callback => {
	// let mysql = require('mysql');

	let connection;
    /*
    connection = mysql.createConnection({
        host: config.RDS_HOST,
        user: config.RDS_USER,
        password: config.RDS_PWD,
        port: config.RDS_PORT,
        database: config.RDS_DATABASE,
        multipleStatements: true,
    });

	connection.connect(function(err) {
        if (!err) {
            console.log('Connected to database.');
        } else {
            console.error('Database connection failed: ' + err.stack);
        }
    });
    */


	// connect to a database if needed, then pass it to `callback`:
	callback(connection);
}