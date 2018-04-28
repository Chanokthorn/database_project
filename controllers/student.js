let express = require('express');
let router = express.Router();
let mysql = require('../config/mysql');

router.get('/', function (req, res, next) {
  mysql.query("SELECT * FROM students", function (err, result) {
    if (err) console.error(err);
    else res.send(result);
  });
});
// DOES NOT CHECK GRAD AND UNGRAD
router.post('/register/add',function(req,res){
  let checksql = "SELECT * FROM sections \
          WHERE course_id = ? AND\
                section_id = ? AND\
                year = ? AND\
                semester = ? ; ";
  let sql = "INSERT INTO register (`course_id`,`section_id`,`year`,`semester`,`student_id`,`grade`)\
     VALUES (?, ?, ?, ?,?, 'R') ";              
  mysql.query(checksql,[req.body.course_id, req.body.section_id, req.body.year ,req.body.semester],function(err,result){
    if (err) console.log("CHECK ERROR");
    else if(result.lenght === 0 ) res.send("NOT FOUND COURSE");
    else{
      mysql.query(sql,[req.body.course_id, req.body.section_id, req.body.year ,req.body.semester,req.session.userID],function(err,result){
        if(req.session.userType === 'student'){
          if (err) res.send("FAIL");
          else {
            console.log(result);
            res.send("OK");
          }
        }
        else res.send("FAIL NOT STUDENT");
      });
    }
  });
});

router.post('/request', function(req, res, next){
  if(!req.session.isLogin || req.session.userType != 'student') res.send('FAIL');
  else{
    let query = `INSERT INTO requests (student_id, type) VALUES (${req.session.userID.toString()}, '${req.body.type}')`
    mysql.query(query, function(err, result){
      if(err) return res.send(err);
      else return res.send('OK');
    });
  }
});

router.get('/payment', function(req, res, next){
  if(!req.session.isLogin || req.session.userType != 'student') res.send('FAIL');
  else{
    let student_id = req.session.userID.toString();
    let query = `SELECT * FROM undergrad_students WHERE student_id=${req.session.userID }`;
    mysql.query(query, function (err, result1){
      if(err || result1.length == 0) return res.send('ERROR');
      else{
        query = `SELECT * FROM students WHERE student_id=${req.session.userID }`;
        mysql.query(query, function (err, result2){
          if(err) return res.send('ERROR');
          else{
            let date  = new Date().getFullYear();
            query = `SELECT * FROM fees WHERE year=${date} AND department_id=${result2[0].department_id}\
            AND faculty_id=${result2[0].faculty_id}`;
            mysql.query(query, function(err, result3){
              if(err) return res.send('ERROR');
              else return res.send(result3);
            });
          }
        });
      }
    });
  }
});

router.post('/register/withdraw', function(req, res, next){
  if(!req.session.isLogin || req.session.userType != 'student') res.send('FAIL');
  else{
    let course_id = req.body.course_id;
    let section_id = req.body.section_id;
    let year = req.body.year;
    let semester = req.body.semester;
    let student_id = req.session.userID;
    let query = `UPDATE register SET grade = 'W' WHERE course_id=${course_id} AND section_id=${section_id}\
    AND year=${year} AND semester=${semester} AND student_id=${student_id}`;
    mysql.query(query, function(err, result){
      if(err) return res.send('FAIL');
      else{
        return res.send('OK')
      }
    });
  }
});

router.post('/register/remove', function(req, res, next){
  if(!req.session.isLogin || req.session.userType != 'student') res.send('FAIL');
  else{
    let course_id = req.body.course_id;
    let section_id = req.body.section_id;
    let year = req.body.year;
    let semester = req.body.semester;
    let student_id = req.session.userID;
    console.log(student_id);
    let query1 = `SELECT * FROM undergrad_students WHERE student_id = ${student_id}`;
    mysql.query(query1, function(err, result1){
      if(err){
        console.log('NOT IN UNDERGRAD STUDENTS');
        return res.send('FAIL');
      }
      else{
        let query2 = `DELETE FROM database_project.register WHERE course_id=${course_id} \
        AND section_id=${section_id} AND year=${year} AND semester=${semester} AND student_id=${student_id};`;
        mysql.query(query2, function(err, result2){
          if(err){
            console.log('UNABLE TO REMOVE REGISTERED COURSE');
            return res.send('FAIL');
          }
          else return res.send('OK');
        });
      }
    });
  }
});

//DOES NOT CHECK RAD OR UNDER GRAD
router.get('/course/all',function(req,res){

  const student_id = req.session.userID;
  console.log(student_id)
  const query = `select * from register natural join courses where student_id = ${student_id};`
  	
	const promise = new Promise((resolve, reject) => {
		mysql.query(query, function(err, doc) {
			if (err) {
        console.log(err);
        reject(err) 
      }
			else resolve(doc);
		});
	});
	
	promise.then((doc) => {res.send(doc)}).catch((err) => res.send(err));
});

router.get('/request',function(req,res){
  if(req.session.userType === 'student'){
    let userID = req.session.userID;
    let sql = `SELECT * FROM requests WHERE student_id = ${userID};`
    let result = [];
    mysql.query(sql,function(err,requests){
      if (err) res.send({});
      else{
        requests.map((request,index) =>{
          result.push(request);
          console.log(requests.length-1);
          if(index === requests.length-1) {
            console.log("OK");
            res.send({'requests' : result});
          }
        });
      }
    });
  }
  else res.send({});
});


// Result: 
// {requests: request (array of object)}
module.exports = router;
