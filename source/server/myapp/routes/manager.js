var express = require('express');
var router = express.Router();

/* login */
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
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

/* TODO */
router.get('/homepage/restaurant', function(req, res, next) {
	res.render('restaurant', { title: '餐厅管理系统', action: 'add', rname: 'test', addr: 'test', tel: 'test', feature: 'fuck' });
});

module.exports = router;

