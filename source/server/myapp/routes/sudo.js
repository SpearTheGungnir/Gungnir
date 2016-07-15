var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

router.get('/*', function(req, res, next) {
	if (req.session.type !== 2)
		res.redirect('/');
	else
		next();
});

/* UserList */
router.get('/users/list:page', function(req, res, next) {
	var page = parseInt(req.params.page);
	var numOfPage = 10;
	var query = 'select u.id, u.uname, u.type, r.rname, u.time from users u left join restaurants r on u.id = r.owner';
	if (!isNaN(page) && page >= 0)
		query += ' limit ' + page * numOfPage + ', ' + numOfPage;
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Succeeded! - ' + rows.length);
		res.render('userList', {title: 'UserList', page: page, list: rows});
	});
});

/* RestaurantList */
router.get('/restaurants/list:page', function(req, res, next) {
	var page = parseInt(req.params.page);
	var numOfPage = 10;
	var query = 'select r.id, r.rname, r.owner, u.uname, r.addr, r.tel, r.feature, r.photo, r.time from restaurants r, users u where r.owner = u.id';
	if (!isNaN(page) && page >= 0)
		query += ' limit ' + page * numOfPage + ', ' + numOfPage;
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Succeeded! - ' + rows.length);
		res.render('restaurantList', {title: 'RestaurantList', page: page, list: rows});
	});
});

/* CommentList */
router.get('/comments/list:page', function(req, res, next) {
	var page = parseInt(req.params.page);
	var numOfPage = 10;
	var query = 'select c.id, c.uid, u.uname, c.fid, f.fname, c.score, c.comment, c.time from fcomments c, users u, foods f where c.uid = u.id and c.fid = f.id';
	var arr = new Array();
	var first = true;
	if (req.query.uname != null && req.query.uname !== '') {
		query += ' and u.uname = ?';
		arr.push(req.query.uname);
		first = false;
	} else 
		req.query.uname = '';
	if (req.query.fname != null && req.query.fname !== '') {
		query += ' and f.fname = ?';
		arr.push(req.query.fname);
	} else
		req.query.fname = '';
	if (!isNaN(page) && page >= 0)
		query += ' limit ' + page * numOfPage + ', ' + numOfPage;
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, arr, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Succeeded! - ' + rows.length);
		res.render('commentList', {title: 'CommentList', page: page, list: rows, search: {uname: req.query.uname, fname: req.query.fname}});
	});		
});

/* FoodList */
router.get('/foods/list:page', function(req, res, next) {
	var page = parseInt(req.params.page);
	var numOfPage = 10;
	var query = 'select f.id, f.fname, f.owner, r.rname, f.origin, f.price, f.feature, f.photo, f.special, f.time from foods f, restaurants r where f.owner = r.id';
	var arr = new Array();
	if (req.query.rname != null && req.query.rname !== '') {
		query += ' and r.rname = ?';
		arr.push(req.query.rname);
		first = false;
	} else 
		req.query.rname = '';
	if (!isNaN(page) && page >= 0)
		query += ' limit ' + page * numOfPage + ', ' + numOfPage;
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, arr, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Succeeded! - ' + rows.length);
		res.render('foodList', {title: 'foodList', page: page, list: rows, search: {rname: req.query.rname}});
	});		
});

module.exports = router;

