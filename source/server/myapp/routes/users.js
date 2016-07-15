var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var page = parseInt(req.query.page);
  var numPage = 10;  // the number of users in a page
  var query = 'select * from users';
  if (!isNaN(page) && page >= 0) {
    query += ' limit ' + (page * numPage) + ',' + numPage;
  }
  console.log(new Date() + ': [mysql-query] - ' + query);
  mysql.query(query, function(err, rows, fields) {
    if (err)
      console.log(new Date() + ': [mysql-query] - ' + err);
    else
      console.log(new Date() + ': [mysql-query] - Succeeded! ' + 
				rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set'); 
    res.json(rows);
  });
});

router.get('/session', function (req, res, next) {
	console.log(req.session);
	res.json(req.session);
});

/* REGISTER Step-1 */
router.post('/register', function(req, res, next) {
  if (req.body.user == null || req.body.user == '' || req.body.pwd == null || req.body.pwd == '') {
    console.log(new Date() + ': [register] - bad request');
		res.json({res : false, info : 'bad request'});
    return;
  }
  var query = 'select 1 from users where uname = ? limit 1';
  console.log(new Date() + ': [mysql-query] - ' + query);
  mysql.query(query, [req.body.user], function(err, rows, fields) {
    if (err)
      console.log(new Date() + ': [mysql-query] - ' + err);
    else
      console.log(new Date() + ': [mysql-query] - Succeeded! ' + 
			  rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set');
    if (rows.length) {
      console.log(new Date() + ': [register] - Username Repeated');
      res.json({res : false, info : 'repeat'});		// duplicate
    } else {
      next();		// step into step-2
    }
  });
});

/* REGISTER Step-2 */
router.post('/register', function(req, res, next) {
  var query = 'insert into users values (null, ?, ?, 0, now())';
	var type = parseInt(req.body.type);
	if (!isNaN(type) && type === 1)
	  query = 'insert into users values (null, ?, ?, 1, now())';
  console.log(new Date() + ': [mysql-insert] - ' + query);
  mysql.query(query, [req.body.user, req.body.pwd], function(err, rows, fields) {
    if (err) {
      console.log(new Date() + ': [mysql-insert] - ' + err);
      res.json({res : false, info : 'insert fail'});
    }
    else {
      console.log(new Date() + ': [mysql-insert] - Succeeded! ' + rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set');
      console.log(new Date() + ': [register] - Succeeded!');
      res.json({res : true, info : ''});
    }
  });
});

/* LOGIN */
router.post('/login', function(req, res, next) {
	if (req.body.user == null || req.body.pwd == null) {
		console.log(new Date() + ': [login] - bad request');
		res.json({res : true, info : 'bad request'});
		return;
	}
	var query = 'select id, uname, type from users where uname = ? and pwd = ? limit 1';
  console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.body.user, req.body.pwd], function(err, rows, fields) {
    if (err) {
      console.log(new Date() + ': [mysql-query] - ' + err);
      res.json({res : false, info : 'query fail'});
			return;
    }
	  console.log(new Date() + ': [mysql-query] - Succeeded! ' + 
			rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set'); 
		if (rows.length) {
		  console.log(new Date() + ': [login] - User: ' + req.body.user + ' - Succeeded!');
			req.session.userid = rows[0].id;
			req.session.username = rows[0].uname;
			req.session.type = rows[0].type;
			res.json({res : true, info : {name : rows[0].uname, id : rows[0].id, type : rows[0].type}});
		} else {
			console.log(new Date() + ': [login] - User: ' + req.body.user + ' - Failed!');
			res.json({res : false, info : 'wrong'});
		}
	});
});

/* LOGOUT */
router.get('/logout', function(req, res, next) {
  console.log(new Date() + ': [logout] - ' + req.session.userid);
	req.session.userid = -1;
	res.json({res : true, info : ""});
});

/* DELETE user - step 1 */
router.get('/delete', function(req, res, next) {
	if (req.query.user == null || isNaN(req.query.user)) {
    console.log(new Date() + ': [delete-user] - bad request');
		res.json({res : false, info : 'bad request'});
		return;
	}
	var loginid = req.session.userid;
	if (loginid == null || loginid <= 0 || isNaN(loginid)) {
    console.log(new Date() + ': [delete-user] - logout');
		res.json({res : false, info : 'logout'});
		return;
	}
	if (loginid == req.query.user) {
		console.log(new Date() + ': [delete-user] - self');
		res.json({res : false, info : 'self'});
		return;
	}
  var query = 'select type from users where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [loginid], function (err, rows, fields) {
	  if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [delete-user] - user don\'t exist');
			res.json({res : false, info : 'bad user'});
			return;
		}
		var type = rows[0].type;
		if (type == 2) {  // has power
			next();
		} else {
			console.log(new Date() + ': [delete-user] - no power');
			res.json({res : false, info : 'no power'});
		}
	});
});

/* DELETE user - step 2 */
router.get('/delete', function(req, res, next) {
	var query = 'select type from users where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.user], function(err, rows, fields) {
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		if (rows.length === 0) {
			console.log(new Date() + ': [delete-user] - user don\'t exist');
			res.json({res : false, info : 'bad user'});
			return;
		}
		var type = rows[0].type;
		if (type != 2) {  // can delete
			next();
		} else {
			console.log(new Date() + ': [delete-user] - denied');
			res.json({res : false, info : 'denied'});
		}
	});
});

/* DELETE user - step 3 */
router.get('/delete', function(req, res, next) {
	var query = 'delete from users where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, [req.query.user], function(err, rows, fields) {
    if (err) {
    	console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		console.log(new Date() + ': [delete-user] - Succeeded!');
		res.json({res : true, info : ''});
	});
});

module.exports = router;
