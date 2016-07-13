var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var foodjson = require('../json/food.json');

/* login */
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});

/* register */
router.get('/register', function(req, res, next) {
	res.render('register', { title: 'Register' });		
});

router.get('/homepage', function(req, res, next) {
	var userid = parseInt(req.session.userid);
	if (isNaN(userid) || userid <= 0) {
		res.redirect('/');
	} else {
		res.render('homepage', { title: 'Gungnir', username: req.session.username, userid: userid, usertype: req.session.type});
	}
});

router.get('/homepage/*', function(req, res, next) {
	var userid = parseInt(req.session.userid);
	if (isNaN(userid) || userid <= 0) {
		res.redirect('/');
	} else {
		next();
	}
});

router.post('/homepage/*', function(req, res, next) {
	var userid = parseInt(req.session.userid);
	if (isNaN(userid) || userid <= 0) {
		res.redirect('/');
	} else {
		next();
	}
});

/* ADD UPDATE restaurant*/
router.get('/homepage/restaurant', function(req, res, next) {
	var query = 'select * from restaurants where owner = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, req.session.userid, function(err, rows, fields) {
	    if(err) {
			console.log(new Date() + '[mysql-query] - ' + err); 
		} else {
			console.log(new Date() + '[mysql-query] - Succeeded!');
		}
	    if(rows.length) {
    		res.render('restaurant', { title: '餐厅管理系统', action: 'update', rname: rows[0].rname, addr: rows[0].addr, tel: rows[0].tel, feature: rows[0].feature, disabled: '', rid: rows[0].id });	
		} else {
			res.render('restaurant', { title: '餐厅管理系统', action: 'add', rname: '', addr: '', tel: '', feature: '', disabled: 'disabled = \'disabled\'', rid: 0 });
		}	
		//res.json(rows);
	});
});

/* MANAGER FOOD */
router.get('/homepage/foods/*', function(req, res, next) {
	var query = 'select id from restaurants where owner = ?';
	console.log(new Date + ': [mysql-query] - ' + query);
	mysql.query(query, [req.session.userid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.redirect('/manager/homepage');
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [foods] - bad user');
			res.redirect('/manager/homepage');
			return;
		}
		req.rid = rows[0].id;
		next();
	});
});

/* MANAGER FOOD */
router.post('/homepage/foods/*', function(req, res, next) {
	var query = 'select id from restaurants where owner = ?';
	console.log(new Date + ': [mysql-query] - ' + query);
	mysql.query(query, [req.session.userid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.redirect('/manager/homepage');
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [foods] - bad user');
			res.redirect('/manager/homepage');
			return;
		}
		req.rid = rows[0].id;
		next();
	});
});

/* ADD UPDATE food*/
router.get('/homepage/foods/list', function(req, res, next) {
	var query = 'select * from foods where owner = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.rid], function(err, rows, fields) {
		if (err)
			console.log(new Date() + ': [mysql-query] - ' + err);
		res.render('foods', {title: '食堂', list: rows});	
	});
});

router.get('/homepage/foods/change/*', function(req, res, next) {
	var fid = parseInt(req.query.fid);
	if (isNaN(fid) || fid <= 0) {
		console.log(new Date() + ': [foods] - bad requset');
		res.render('result', foodjson);
		return;
	}
	var query = 'select 1 from foods f where f.id = ? and f.owner = ? limit 1';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [fid, req.rid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.render('result', foodjson);
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [foods] - bad user');
			res.render('result', foodjson);
			return;
		}
		next();
	});
});

/* UPDATE food */
router.get('/homepage/foods/change/update', function(req, res, next) {
	if (req.query.name == null || req.query.fname === '' ||
			req.query.origin == null || req.query.price == null || req.query.feature == null) {
		console.log(new Date() + ': [foods] - bad requset');
		res.render('result', foodjson);
		return;
	}
	var query = 'update foods set fname = ?, origin = ?, price = ?, feature = ? where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.name, req.query.origin, req.query.price, req.query.feature, req.query.fid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.render('result', foodjson);
			return;
		}
		foodjson.result = '成功了';
		res.render('result', foodjson);
		foodjson.result = '出错了';
	});
});

/* SPECIAL food step-1 */
router.get('/homepage/foods/change/special', function(req, res, next) {
	var query = 'update foods set special = false where owner = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.rid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.render('result', foodjson);
			return;
		}
		next();
	});
});

/* SPECIAL food step-2 */
router.get('/homepage/foods/change/special', function(req, res, next) {
	var query = 'update foods set special = true where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.fid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.render('result', foodjson);
			return;
		}
		foodjson.result = '成功了';
		res.render('result', foodjson);
		foodjson.result = '出错了';
	});
});

/* DELETE food */
router.get('/homepage/foods/change/delete', function(req, res, next) {
	var query = 'delete from foods where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.fid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.render('result', foodjson);
			return;
		}
		foodjson.result = '成功了';
		res.render('result', foodjson);
		foodjson.result = '出错了';
	});
});

/* ADD food*/
router.get('/homepage/foods/add', function(req, res, next) {
  if (req.query.name == null || req.query.fname === '' ||
			req.query.origin == null || req.query.price == null || req.query.feature == null) {
		console.log(new Date() + ': [foods] - bad requset');
		res.render('result', foodjson);
		return;
	}
	var query = 'insert into foods values (null, ?, ?, ?, ?, ?, null, false, now())';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.name, req.rid, req.query.origin, req.query.price, req.query.feature], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.render('result', foodjson);
			return;
		}
		foodjson.result = '成功了';
		res.render('result', foodjson);
		foodjson.result = '出错了';
	});
});

/* UPLOAD food */
router.post('/homepage/foods/change/upload', function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = path.join(__dirname, '..', 'uploads'); 
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;

	form.parse(req, function(err, fields, files) {
		if (err) {
			console.log(new Date() + ': [upload] - ' + err);
			res.render('result', foodjson);
			return;
		}
		var fid = parseInt(fields.fid);
		if (isNaN(fid)) {
			console.log(new Date() + ': [upload] - ' + err);
			res.render('result', foodjson);
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
				res.render('result', foodjson);
				return;
		}
		var newName = fid + '.' + ext;
		var distPath = path.join(__dirname, '..', '..', 'public/img/foods/');
		// mv file
		console.log(new Date() + ': [upload] - Succeeded! - ' + newName);
		var query = 'update foods set photo = ? where id = ? and owner = ?';
		console.log(new Date() + ': [mysql-query] - ' + query);
		mysql.query(query, ['/img/foods/' + newName, fid, req.rid], function(err, rows, fields) {
			console.log(rows);
			if (err) {
				console.log(new Date() + ': [mysql-query] - ' + err);
				res.render('result', foodjson);
			} else if (rows.affectedRows) {
				fs.renameSync(files.upload.path, distPath + newName);
				foodjson.result = '成功了';
				res.render('result', foodjson);
				foodjson.result = '出错了';
			} else {
				console.log(new Date() + ': [upload] - fail');
				res.render('result', foodjson);
			}
		});
	});
});

module.exports = router;

