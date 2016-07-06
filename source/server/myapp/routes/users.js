var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var user = require('../models/user');
//mongoose.connect('mongodb://localhost/gungnir');

/* GET users listing. */
router.get('/', function(req, res, next) {
  user.find(function(err, doc) {
    res.json(doc);
  });
});

/* Register Check */
router.post('/register', function(req, res, next) {
  if (req.body.user == null || req.body.user === "" || req.body.pwd == null || req.body.pwd === "") {
    res.json({res : false, info : "bad request"});
    return;
  }
  user.count({user : req.body.user}, function (err, doc) {
    if (doc === 1) {
      res.json({res : false, info : "repeat"});
    } else {
      next(); // Good, go to next step
    }
  });
});

/* Register Insert */
router.post('/register', function(req, res, next) {
  var newUser = new user({user : req.body.user, pwd : req.body.pwd});
  
  newUser.save(function (err, product, numberAffected) {
    if (err)
      res.json({res : false, info : "insert fail"});
    else
      res.json({res : true, info : ""});
  });
});

/* Login Check */
router.post('/login', function(req, res, next) {
  if (req.body.user == null || req.body.pwd == null) {
    res.json({res : false, info : "bad request"});
    return;
  }
  user.count({user : req.body.user, pwd : req.body.pwd}, function (err, doc) {
    if (doc === 1) {
      res.json({res : true, info : ""});
    } else {
      res.json({res : false, info : "wrong"});
    }
  });
});

module.exports = router;
