var mysql = require('mysql');

function handleError(err) {
	if (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST')
			connect();
		else
			console.error(err.stack || err);
	}
}

var connection;

function connect() {
	connection = mysql.createConnection({
  	host : '127.0.0.1',
  	user : 'gungnir',
  	password : '233',
  	database : 'gungnir',
  	port : '3306',
		useConnectionPoolong : true
	});
	connection.connect(handleError);
	connection.on('error', handleError);
}

connect();

module.exports = connection;

