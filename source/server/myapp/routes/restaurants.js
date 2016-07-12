var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs=require('fs');
var path=require('path');
var json=require('../json/restaurant.json');

/* GET resturants listing */
router.get('/', function(req, res, next) {
	var page = parseInt(req.query.page);
	var numPage = 10;
	var query = 'select restaurants.*, ifnull(photo, \'/img/restaurants/default.jpeg\') as photoaddr, ifnull(avg(score), 5.0) as avg from restaurants left join rmark on id = rid group by id';
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
		//res.json({res : false, info : 'bad request'});
		res.render('result', json);
		return;
	}
	var userid = parseInt(req.session.userid);
  if (isNaN(req.session.userid) || userid <= 0) {
		console.log(new Date() + ': [restaurant-add] - logout');
		//res.json({res : false, info : 'logout'});
		res.render('result', json);
		return;
	}
	var query = 'select type from users where id = ? limit 1';
	console.log(new Date + ': [mysql-query] - ' + query);
	mysql.query(query, [userid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			//res.json({res : false, info : 'query fail'});
      res.render('result', json);
		} else {
			console.log(new Date() + ': [mysql-query] - Secceeded! ' +
				rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set');
			if (rows.length) {
				if (rows[0].type) {
					next();			// pass!
				} else {
					console.log(new Date() + ': [restaurant-add] - no power');
					//res.json({res : false, info : 'no power'});
          res.render('result', json);
				}
			} else {
				console.log(new Date() + ': [restaurant-add] - user don\'t exist');
				//res.json({res : false, info : 'bad user'});
        res.render('result', json);
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
      //res.json({res : false, info : 'insert fail'});
      res.render('result', json);
		} else {
			console.log(new Date() + ': [restaurant-add] - Succeeded!');
			//res.json({res : true, info : ''});
			var tmp = json;
			json.result = '成功了';
			res.render('result', json);
			json.result = '出错了';
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
  var query = 'select photo from users u join restaurants r on u.id = r.owner where r.id = ? and (? = 2 or u.id = ?) limit 1';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.rid, req.session.type, loginid], function (err, rows, fields) { //删除操作的用户是否存在且有权限
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
		req.rphoto = rows[0].photo;
		next();
	});
});

/* DELETE restaurant - step 2 */
router.get('/delete', function(req, res, next) {
	var query = 'select photo from foods where owner = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.rid], function(err, rows, fields) { //被删除餐馆的菜
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		var photoPath = path.join(__dirname, '..', 'public');
		for (var i = 0; i < rows.length; ++i)
			if (rows[i].photo)
				fs.unlink(photoPath + rows[i].photo, function(err) {
					if (err) {
						console.log(new Date() + ': [delete-file] - ' + err);
					}
				});
		fs.unlink(photoPath + req.rphoto, function(err) {
			if (err) {
				console.log(new Date() + ': [delete-file] - ' + err);
			}
		});
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

/* UPDATE restaurants - step 1 !!!!!*/
router.get('/update', function(req, res, next) {
	if (req.query.name == null || req.query.name == '' ||
		req.query.addr == null || req.query.tel == null ||
		req.query.feature == null) {  //输入检测
		console.log(new Date()  + ': [update-restaurant] - bad request');
		//res.json({res : false, info : 'bad request'});
		res.render('result', json);		
		return;
	}
	
	var loginid = req.session.userid;
	if (loginid == null || loginid <= 0 || isNaN(loginid)) { //登录检测
    console.log(new Date() + ': [update-restaurant] - logout');
		//res.json({res : false, info : 'logout'});
		res.render('result', json);
		return;
	}
    var query = 'select 1 from restaurants where owner = ?';// and id = ?';因为owner是unique
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [loginid], function (err, rows, fields) { //更新操作的用户是否存在且有权限（操作者id==owner）
	  if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			//res.json({res : false, info : 'query fail'});
			res.render('result', json);
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [update-restaurant] - owner of this reataurant doesn\'t exist OR restaurant doesn\'t exist');
			//res.json({res : false, info : 'bad onwer OR bad restaurant'});
			res.render('result', json);
			return;
		}
		next();
	});
});



/* UPDATE restaurant - step 2 !!!!*/
router.get('/update', function(req, res, next) {
	var query = 'update restaurants set rname = ?, addr = ?, tel = ?, feature = ? where owner = ?';//id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.name, req.query.addr, req.query.tel, req.query.feature, req.session.userid], function(err, rows, fields) { //Update餐厅, 我就认为到这一步的时候还没有掉线……
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			//res.json({res : false, info : 'query fail'});
			res.render('result', json);
			return;
		}
		console.log(new Date() + ': [update-restaurant] - Succeeded!');
		//res.json({res : true, info : ''});
		json.result = '成功了';
    res.render('result', json);
		json.result = '失败了';
	});
});

/* UPLOAD photo  */
router.post('/upload', function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = path.join(__dirname, '..', 'uploads'); 
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;

	form.parse(req, function(err, fields,files) {
		if (err) {
			console.log(new Date() + ': [upload] - ' + err);
			res.render('result', json);
			return;
		}
		var ext = '';
		switch (files.upload.type) {
			case 'image/pjpeg':
				ext = 'jpg';
				break;
			case 'image/jpeg':
				ext = 'jpg';
				break;
			case 'image/png':
				ext = 'png';
				break;
			case 'image/x-png':
				ext = 'png';
				break;
			default:
				res.render('result', json);
				return;
		}
		var query = 'select id from restaurants where owner = ? limit 1';
		mysql.query(query, [req.session.userid], function(err, rows, fields) {
			if (err) {
				console.log(new Date() + ': [mysql-query] - ' + err);
				res.render('result', json);
				return;
			}
			if (rows.length === 0) {
				console.log(new Date() + ': [upload] - bad user')
				res.render('result', json);
				return;
			}
			var uid = rows[0].id;
			var newName = uid + '.' + ext;
			var distPath = path.join(__dirname, '..', 'public/img/restaurants/');
			// mv file
			fs.renameSync(files.upload.path, distPath + newName);
			console.log(new Date() + ': [upload] - Succeeded! - ' + newName);
			var query = 'update restaurants set photo = ? where id = ?';
			console.log(new Date() + ': [mysql-query] - ' + query);
			mysql.query(query, ['/img/restaurants/' + newName, uid], function(err, rows, fields) {
				if (err) {
					console.log(new Date() + ': [mysql-query] - ' + err);
					res.render('result', json);
				} else {
					json.result = '成功了';
					res.render('result', json);
					json.result = '出错了';
				}
			})
		});
	});
});

/* ADD MARK */
router.get('/addMark', function(req, res, next) {
	if (req.query.rid == null || req.query.rid == '' ||
		req.query.uid == null || req.query.score == null ) {  //输入检测
		console.log(new Date()  + ': [add-rmark-restaurant] - bad request');
		res.json({res : false, info : 'bad request'});
		return;
	}
	
	var loginid = req.session.userid;
	if (loginid == null || loginid <= 0 || isNaN(loginid)) { //登录检测
    console.log(new Date() + ': [add-rmark-restaurant] - logout');
		res.json({res : false, info : 'logout'});
		return;
	}	
	
	var query = 'insert into rmark values(?, ?, ?, now())';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.uid, req.query.rid, req.query.score], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
        res.json({res : false, info : 'insert fail'});   //可防止重复评分
		} else {
			console.log(new Date() + ': [add-rmark-restaurant] - Succeeded!');
			res.json({res : true, info : ''});
		}
	});
});

module.exports = router;
