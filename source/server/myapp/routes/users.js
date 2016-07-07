var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var page = req.query.page;
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
  var query = 'insert into users values (null, ?, ?, now())';
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
	var query = 'select id from users where uname = ? and pwd = ? limit 1';
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
			res.json({res : true, info : rows[0].id});
		} else {
			console.log(new Date() + ': [login] - User: ' + req.body.user + ' - Failed!');
			res.json({res : false, info : 'wrong'});
		}
	});
});

module.exports = router;
