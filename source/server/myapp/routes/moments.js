var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs=require('fs');
var path=require('path');

router.get('/', function(req, res, next) {
	var query = 'select m.id, uid, uname, comment, photo as photoaddr, m.time from moments m, users u where uid = u.id' ;
	var uid = parseInt(req.query.user);
	if (!isNaN(uid) && uid >= 0)
		query += ' and uid = ' + uid;
	var numOfPage = 10;
	var page = parseInt(req.query.page);
	if (!isNaN(page) && page >= 0) {
		query += ' limit ' + numOfPage * page + ',' + numOfOage;
	}
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		console.log(new Date() + ': [mysql-query] - Succeeded!');
		res.json(rows);
	});
});

module.exports = router;
