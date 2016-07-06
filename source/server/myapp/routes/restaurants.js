var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Restaurant = require('../models/restaurant');

/* GET restaurants listing */
router.get('/', function(req, res, next) {
  var page = parseInt(req.query.page);
  var numOfPage = 10;  // the number of restaurants in a page
  if (!isNaN(page) && page >= 0) {
    var query = Restaurant.find({});
    query.limit(numOfPage);
    query.skip(page * numOfPage);
    query.exec(function(err, docs) {
      res.json(docs);
    });
    return;
  }
  Restaurant.find(function(err, doc) {
    res.json(doc);
  });
});

/* ADD restaurant */
router.get('/add', function(req, res, next) {
  if (req.query.rname == null || req.query.rname === "" ||
      req.query.addr == null || req.query.addr == "" ||
      req.query.tel == null || req.query.tel === "" ||
      req.query.feature == null || req.query.feature === "") {
      res.json({res : false, info : "bad request"});
    return;
  }
  var restaurant = new Restaurant({
    rname : req.query.rname,
    addr : req.query.addr,
    tel : req.query.tel,
    feature : req.query.feature
  });
  restaurant.save(function (err) {
    if (err)
      res.json({res : false, info : "insert fail"});
    else
      res.json({res : true, info : ""}); 
  });
});

module.exports = router;
