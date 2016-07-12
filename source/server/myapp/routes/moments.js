var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs=require('fs');
var path=require('path');

router.get('/', function(req, res, next) {
	var query = 'select m.id, uid, uname, comment, photo as photoaddr, m.time from moments m, users u where uid = u.id' ;
	var uid = parseInt(req.query.user);
	if (!isNaN(uid) && uid >= 0)
		query += ' and uid = ' + uid;
	var numOfPage = 10;
	var page = parseInt(req.query.page);
	if (!isNaN(page) && page >= 0) {
		query += ' limit ' + numOfPage * page + ',' + numOfPage;
	}
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res : false, info : 'query fail'});
			return;
		}
		console.log(new Date() + ': [mysql-query] - Succeeded!');
		res.json(rows);
	});
});



/* upload step1 */
router.post('/uploadpic', function(req, res, next) {

	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = path.join(__dirname, '..', 'public/uploads/images'); 
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;
    
	console.log('23');
	form.parse(req, function(err, fields, files) {              //解析表单
		if (err) {
			console.log(new Date() + ': [moment-add] - ' + err);
			res.json({res : false, info : 'bad request'});
			return;
		}      
		
		if (fields.comment == null || fields.comment == '' ||
			fields.uid == null ) {                              
		    console.log(new Date()  + ': [moment-add] - bad request');
		    res.json({res : false, info : 'bad request'});
		    return;
	    }
	
    	// save uid, comment into database
	    var insertComment = 'insert into moments values(null, ?, ?, null, now())';
        console.log(new Date() + ': [mysql-query] - ' + insertComment);
	    mysql.query(insertComment, [fields.uid, fields.comment], function(err, rows, fields) {
		    if (err) {
                console.log(new Date() + ': [mysql-insert] - ' + err);
                res.json({res : false, info : 'insert fail'});
	    	    return;
            } else {
                console.log(new Date() + ': [mysql-insert] - Succeeded! ' + rows.length + ' row' + (rows.length > 1 ? 's' : '') + ' in set');
                console.log(new Date() + ': [moment-comment-add] - Succeeded!');
			    req.mid = rows.insertId;  //获取刚插入的moment id
			    console.log(new Date() + ': last_id is ' + req.mid);
				
				
				if(files.upload.size == 0) {
					console.log(new Date() + 'no file update, or size is 0');
					res.json({res: false, info: 'no file'});
					return;
				} else {
    				req.files = files; //只有req, res传到了next里面吗
				    next();
				}
		    }
	    });		
	});
});

/* upload step2 */
router.post('/uploadpic', function(req, res, next) {
	var ext = '';
	switch (req.files.upload.type) {
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
			//res.render('result', json);
			console.log('pic type: default');
			res.json({res: false, info: 'default'});
			return;
	}
		
    //重命名
    var newName = req.mid + '.' + ext;
	var distPath = path.join(__dirname, '..', 'public/img/moments/');
    fs.renameSync(req.files.upload.path, distPath + newName);
    console.log(new Date() + ': [add-moment-photo-toDist]- Succeeded! - ' + newName);

    //路径存入数据库	
	var query = 'update moments set photo = ? where id = ?';
	console.log(new Date() + ': [mysql-query] - ' + query);
	mysql.query(query, ['/img/moments/' + newName, req.mid], function(err, rows, fields) {
		if (err) {
			console.log(new Date() + ': [mysql-query] - ' + err);
			res.json({res: false, info: 'add photo path to db fail'});
			return;
		} else {
			res.json({res: true, info: 'add photo path to db success'});
		}
	});
});




module.exports = router;
