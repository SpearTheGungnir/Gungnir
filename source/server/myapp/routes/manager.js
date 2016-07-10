var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');

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
    		res.render('restaurant', { title: '餐厅管理系统', action: 'update', rname: rows[0].rname, addr: rows[0].addr, tel: rows[0].tel, feature: rows[0].feature, disabled: '' });	
		} else {
			res.render('restaurant', { title: '餐厅管理系统', action: 'add', rname: '', addr: '', tel: '', feature: '', disabled: 'disabled = \'disabled\'' });
		}	
		//res.json(rows);
	});
});

module.exports = router;

