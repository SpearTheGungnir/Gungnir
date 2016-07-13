var express = require('express');
var router = express.Router();
var mysql = require('../connect/mysql');
var formidable = require('formidable');
var fs=require('fs');
var path=require('path');

router.get('/', function(req, res, next) {
	var query = 'select m.id, m.uid, uname, comment, photo, m.time, if(l2.uid is null, false, true) isliked, sum(if(l1.uid is null, 0, 1)) as cnt from moments m left join likes l1 on m.id = l1.mid join users u on m.uid = u.id left join likes l2 on l2.uid = ? and l2.mid = m.id ';
	var uid = parseInt(req.query.uid);
	if (!isNaN(uid) && uid >= 0)
		query += ' where m.uid = ' + uid;
	query += ' group by(m.id) order by m.time desc';
	var numOfPage = 10;
	var page = parseInt(req.query.page);
	if (!isNaN(page) && page >= 0) {
		query += ' limit ' + numOfPage * page + ',' + numOfPage;
	}
	console.log(new Date() + ': [mysql-query] - ' + query);
	var lid = parseInt(req.query.lid);
	if (isNaN(lid) || lid <= 0) lid = 0;
	mysql.query(query, [lid], function(err, rows, fields) {
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
	form.uploadDir = path.join(__dirname, '..', '/uploads'); 
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;
    
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

/* delete */
router.get('/delete', function(req, res, next) {
	//mid, uid
	if(req.query.mid == null || req.query.mid == "" ||
	   req.query.uid == null || req.query.uid == "") {
	   console.log(new Date() + ': [delete-moment] - bad request');	 
       res.json({res : false, info : 'bad request'});
	   return;	   
	}
	
	
	var query = 'select 1 from moments where id = ? and uid = ?'; //删除操作用户是否与被删除的朋友圈对应
	mysql.query(query, [req.query.mid, req.query.uid], function(err, rows, fields) {
		if(err) {
			console.log(new Date() + ' : [mysql-query] - ' + err);
			res.json({res: false, info: 'delete fail'});
			return;
		} 
		if(rows.length == 0) {
		    console.log(new Date() + ': [delete-moment] - such moment doesn\'t exist');
		    res.json({res : false, info : 'bad moment'});
		    return;
		} 
		//删除图片
		var deletePic = 'select photo from moments where id = ?';
		mysql.query(deletePic, req.query.mid, function(err, rows, fields) {
			if(err) {
		        console.log(new Date() + ' : [mysql-delete-photo] - ' + err);
		        res.json({res: false, info: 'delete fail'});
		        return;
		    }
			if(rows[0].photo != null ) {
				var photoPath = path.join(__dirname, '..', 'public');
		   		fs.unlink(photoPath + rows[0].photo, function(err) {
		            if (err) {
		                console.log(new Date() + ': [delete-file] - ' + err);
		                res.json({res: false, info: 'delete fail'});
						return;
					}
		        });
			    console.log(new Date() + ' : [mysql-delete-photo] - success!');
		    }
		});
				
		//删除数据库中记录
		var deleteMoment = 'delete from moments where id = ?';
		mysql.query(deleteMoment, [req.query.mid], function(err, rows, fields) {
			if(err) {
		        console.log(new Date() + ' : [mysql-delete] - ' + err);
		        res.json({res: false, info: 'delete fail'});
		        return;
		    }
			console.log(new Date() + ': [delete-moment] - Succeeded!');
		    res.json({res : true, info : ''});
		    return;
		});	
	})
});


module.exports = router;
