var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs=require('fs');
var path=require('path');

/* GET foods listing */
router.get('/', function(req, res, next) {
	var page = parseInt(req.query.page);	
	var id = parseInt(req.query.rid);	
	var numPage = 10;
	var query = 'select *, ifnull(photo, \'/img/foods/default.jpeg\') as photoaddr from foods';
	if (!isNaN(id) && id >= 0)
		query += ' where owner = ' + id;
	if (!isNaN(page) && page >= 0) {
		query += ' limit ' + (page * numPage) + ',' + numPage;
	}
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Secceeded! ' +
				rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set');
		res.json(rows);
	});
});

module.exports = router;
