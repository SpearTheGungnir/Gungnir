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
	var query = 'select f.*, ifnull(f.photo, \'/img/foods/default.jpeg\') as photoaddr, ifnull(avg(c.score), 5.0) as avg from foods f left join fcomments c on f.id = c.fid';
	if (!isNaN(id) && id >= 0)
		query += ' where owner = ' + id;
	query += ' group by f.id order by special desc, id';
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

/* GET comments list */
router.get('/comments', function(req, res, next) {
	query = 'select c.*, u.uname from fcomments c, users u where c.uid = u.id';
	var fid = parseInt(req.query.fid);
	if (!isNaN(fid) && fid > 0)
		query += ' and c.fid = ' + fid;
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Succeeded!');
		res.json(rows);
	});
});

/* ADD comment */
router.get('/comments/add', function(req, res, next) {
	var uid = parseInt(req.query.uid);
	var fid = parseInt(req.query.fid);
	var score = parseInt(req.query.score);
	if (isNaN(uid) || isNaN(fid) || isNaN(score) || score < 0 || score > 5 || req.query.comment == null) {
		console.log(new Date() + ': [add-comment] - bad request');
		res.json({res: false, info: 'bad request'});
		return;
	}
	var query = 'insert into fcomments values (null, ?, ?, ? ,? ,now())';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [uid, fid, score, req.query.comment], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res: false, info: 'query fail'});
		} else {
			console.log(new Date() + ': [mysql-query] - Succeeded!');
			res.json({res: true, info: ''});
		}
	});
});

module.exports = router;
