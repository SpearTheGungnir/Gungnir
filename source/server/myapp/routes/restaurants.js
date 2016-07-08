var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');

/* GET resturants listing */
router.get('/', function(req, res, next) {
	var page = parseInt(req.query.page);
	var numPage = 10;
	var query = 'select * from restaurants';
	if (!isNaN(page) && page >= 0) {
		query += ' limit ' + (page * numPage) + ',' + numPage;
	}
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Secceeded! ' +
				rows.length + ' row' + (rows.length > 1 ? 's' : '') + 'in set');
		res.json(rows);
	});
});

router.get('/add', function(req, res, next) {
	if (req.query.name == null || req.query.name == '' || req.query.addr)
});

module.exports = router;
