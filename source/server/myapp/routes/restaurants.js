var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');

/* GET resturants listing */
router.get('/', function(req, res, next) {
	var page = parseInt(req.query.page);
	var numPage = 10;
	var query = 'select restaurants.*, ifnull(photo, \'img/restaurants/default.jpeg\') as photoaddr, ifnull(avg(score), 5.0) as avg from restaurants left join rmark on id = rid group by id';
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

/* ADD restaurant step-1 */
router.get('/add', function(req, res, next) {
	if (req.query.name == null || req.query.name == '' ||
			req.query.addr == null || req.query.tel == null ||
			req.query.feature == null) {
		console.log(new Date()  + ': [restaurant-add] - bad request');
		res.json({res : false, info : 'bad request'});
		return;
	}
	var userid = parseInt(req.session.userid);
  if (isNaN(req.session.userid) || userid <= 0) {
		console.log(new Date() + ': [restaurant-add] - logout');
		res.json({res : false, info : 'logout'});
		return;
	}
	var query = 'select type from users where id = ? limit 1';
	console.log(new Date + ': [mysql-query] - ' + query);
	mysql.query(query, [userid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
		} else {
			console.log(new Date() + ': [mysql-query] - Secceeded! ' +
				rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set');
			if (rows.length) {
				if (rows[0].type) {
					next();			// pass!
				} else {
					console.log(new Date() + ': [restaurant-add] - no power');
					res.json({res : false, info : 'no power'});
				}
			} else {
				console.log(new Date() + ': [restaurant-add] - user don\'t exist');
				res.json({res : false, info : 'bad user'});
			}
		}
	});
});

/* ADD restaurant step-2 */
router.get('/add', function(req, res, next) {
	var query = 'insert into restaurants values (null, ?, ?, ?, ?, ?, null, now())';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.name, req.session.userid, req.query.addr, req.query.tel, req.query.feature], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
      res.json({res : false, info : 'insert fail'});
		} else {
			console.log(new Date() + ': [restaurant-add] - Succeeded!');
			res.json({res : true, info : ''});
		}
	});
});

/* DELETE restaurants - step 1 */
router.get('/delete', function(req, res, next) {
	if (req.query.rid == null || isNaN(req.query.rid)) { //输入检测
    console.log(new Date() + ': [delete-restaurant] - bad request');
		res.json({res : false, info : 'bad request'});
		return;
	}
	var loginid = req.session.userid;
	if (loginid == null || loginid <= 0 || isNaN(loginid)) { //登录检测
    console.log(new Date() + ': [delete-restaurant] - logout');
		res.json({res : false, info : 'logout'});
		return;
	}
  var query = 'select type from users where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [loginid], function (err, rows, fields) { //删除操作的用户是否存在且有权限
	  if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [delete-restaurant] - user don\'t exist');
			res.json({res : false, info : 'bad user'});
			return;
		}
		var type = rows[0].type;
		if (type == 2) {  // has power
			next();
		} else {
			console.log(new Date() + ': [delete-restaurant] - no power');
			res.json({res : false, info : 'no power'});
		}
	});
});

/* DELETE restaurant - step 2 */
router.get('/delete', function(req, res, next) {
	var query = 'select 1 from restaurants where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.rid], function(err, rows, fields) { //被删除餐馆是否存在
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [delete-restaurant] - restaurant doesn\'t exist');
			res.json({res : false, info : 'bad restaurant'});
			return;
		}
		next();
	});
});

/* DELETE restaurant - step 3 */
router.get('/delete', function(req, res, next) {
	var query = 'delete from restaurants where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.rid], function(err, rows, fields) { //删除餐厅
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		console.log(new Date() + ': [delete-restaurant] - Succeeded!');
		res.json({res : true, info : ''});
	});
});

/* UPDATE restaurants - step 1 */
router.get('/update', function(req, res, next) {
	if (req.query.name == null || req.query.name == '' ||
		req.query.addr == null || req.query.tel == null ||
		req.query.feature == null) {  //输入检测
		console.log(new Date()  + ': [update-restaurant] - bad request');
		res.json({res : false, info : 'bad request'});
		return;
	}
	
	var loginid = req.session.userid;
	if (loginid == null || loginid <= 0 || isNaN(loginid)) { //登录检测
    console.log(new Date() + ': [update-restaurant] - logout');
		res.json({res : false, info : 'logout'});
		return;
	}
  var query = 'select 1 from restaurants where owner = ? and id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [loginid, req.query.rid], function (err, rows, fields) { //更新操作的用户是否存在且有权限（操作者id==owner）
	  if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [update-restaurant] - owner of this reataurant doesn\'t exist OR restaurant doesn\'t exist');
			res.json({res : false, info : 'bad onwer OR bad restaurant'});
			return;
		}
		next();
	});
});



/* UPDATE restaurant - step 2 */
router.get('/update', function(req, res, next) {
	var query = 'update restaurants set rname = ?, addr = ?, tel = ?, feature = ? where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.name, req.query.addr, req.query.tel, req.query.feature, req.query.rid], function(err, rows, fields) { //Update餐厅
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		console.log(new Date() + ': [update-restaurant] - Succeeded!');
		res.json({res : true, info : ''});
	});
});


module.exports = router;
