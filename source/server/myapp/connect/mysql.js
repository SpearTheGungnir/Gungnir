var mysql = require('mysql');

function handleError(err) {
	if (err) {
		connect();
	} else {
		console.error(new Date() + ': [handleError] - ' + err);
	}
}

var connection;

function connect() {
	connection = mysql.createConnection({
  	host : '127.0.0.1',
  	user : 'gungnir',
  	password : '233',
  	database : 'gungnir',
  	port : '3306'
	});
	connection.connect(handleError);
	connection.on('error', handleError);
}

connect();

module.exports = connection;

