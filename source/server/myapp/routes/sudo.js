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
		res.render('userList', {title: 'UserList', username: req.session.username, usertype: req.session.type, page: page, list: rows});
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
		res.render('restaurantList', {title: 'RestaurantList', username: req.session.username, usertype: req.session.type, page: page, list: rows});
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
		res.render('commentList', {title: 'CommentList', username: req.session.username, usertype: req.session.type, page: page, list: rows, search: {uname: req.query.uname, fname: req.query.fname}});
	    console.log(req.session.username);
	});		
});

/* DELETE Comment */
router.get('/comments/delete:id', function(req, res, next) {
  var cid = parseInt(req.params.cid);
	if (isNaN(cid) || cid <= 0) {
		console.log(new Date() + ': [delete-food] - bad request');
		res.json({res: false, info: 'bad request'});
		return;
	}
	var query = 'delete from fcomments where id = ?';
	console.log(new Date() + ': [mysql-query]' + query);
	mysql.query(query, [cid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res: false, info: 'query-fail'});
		} else if (rows.length === 0) {
			console.log(new Date() + ': [delete-comment] - fail');
			res.json({res: false, info: 'delete-fail'});
		} else {
			console.log(new Date() + ': [mysql-query] - Succeeded!');
			console.log(new Date() + ': [delete-comment] - Succeeded!');
			res.json({res: true, info: ''});
		}
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
		res.render('foodList', {title: 'foodList', username: req.session.username, usertype: req.session.type, page: page, list: rows, search: {rname: req.query.rname}});
	});		
});

/* DELETE food */
router.get('/foods/delete:id', function(req, res, next) {
	var fid = parseInt(req.params.id);
	if (isNaN(fid) || fid <= 0) {
		console.log(new Date() + ': [delete-food] - bad request');
		res.json({res: false, info: 'bad request'});
		return;
	}
	var query = 'delete from foods where id = ?';
	console.log(new Date() + ': [mysql-query]' + query);
	mysql.query(query, [fid], function(err, rows, fields) {
		var foodPath = path.join(__dirname, '..', '..', 'public/img/foods/');
		fs.unlink(foodPath + fid + '.jpg', function(err) {
			if (err)
				console.log(new Date() + ': [delete-file] - ' + err);
		});
		fs.unlink(foodPath + fid + '.png', function(err) {
			if (err)
				console.log(new Date() + ': [delete-file] - ' + err);
		});

		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res: false, info: 'query-fail'});
		} else if (rows.length === 0) {
			console.log(new Date() + ': [delete-food] - fail');
			res.json({res: false, info: 'delete-fail'});
		} else {
			console.log(new Date() + ': [mysql-query] - Succeeded!');
			console.log(new Date() + ': [delete-food] - Succeeded!');
			res.json({res: true, info: ''});
		}
	});
});

/* MomentList */
router.get('/moments/list:page', function(req, res, next) {
	var page = parseInt(req.params.page);
	var numOfPage = 10;
	var query = 'select m.id, m.uid, u.uname, m.comment, m.photo, m.time from moments m, users u where m.uid = u.id';
	var arr = new Array();
	if (req.query.uname != null && req.query.uname !== '') {
		query += ' and u.uname = ?';
		arr.push(req.query.uname);
	} else 
		req.query.uname = '';
	if (!isNaN(page) && page >= 0)
		query += ' limit ' + page * numOfPage + ', ' + numOfPage;
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, arr, function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		else
			console.log(new Date() + ': [mysql-query] - Succeeded! - ' + rows.length);
		res.render('momentList', {title: 'momentList', username: req.session.username, usertype: req.session.type, page: page, list: rows, search: {uname: req.query.uname}});
	});		
});

/* DELETE moment */
router.get('/moments/delete:id', function(req, res, next) {
	var mid = parseInt(req.params.id);
	if (isNaN(mid) || mid <= 0) {
		console.log(new Date() + ': [delete-moment] - bad request');
		res.json({res: false, info: 'bad request'});
		return;
	}
	var query = 'delete from moments where id = ?';
	console.log(new Date() + ': [mysql-query]' + query);
	mysql.query(query, [mid], function(err, rows, fields) {
		var momentPath = path.join(__dirname, '..', '..', 'public/img/moments/');
		fs.unlink(momentPath + mid + '.jpg', function(err) {
			if (err)
				console.log(new Date() + ': [delete-file] - ' + err);
		});
		fs.unlink(momentPath + mid + '.png', function(err) {
			if (err)
				console.log(new Date() + ': [delete-file] - ' + err);
		});

		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res: false, info: 'query-fail'});
		} else if (rows.length === 0) {
			console.log(new Date() + ': [delete-food] - fail');
			res.json({res: false, info: 'delete-fail'});
		} else {
			console.log(new Date() + ': [mysql-query] - Succeeded!');
			console.log(new Date() + ': [delete-moment] - Succeeded!');
			res.json({res: true, info: ''});
		}
	});
});

module.exports = router;

