var mysql = require('mysql');

var connection = mysql.createConnection({
  host : '127.0.0.1',
  user : 'gungnir',
  password : '233',
  database : 'gungnir',
  port : '3306'
});

module.exports = connection;

