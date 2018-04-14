var express = require('express');
var router = express.Router();
var mysql = require('../config/mysql');

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

router.post('/register/withdraw', function(req, res, next){
  var course_id = req.body.course_id;
  var section_id = req.body.section_id;
  var year = req.body.year;
  var semester = req.body.semester;
  var student_id = req.session.userID;
  var query = `UPDATE register SET grade = 'W' WHERE course_id=${course_id} AND section_id=${section_id}\
  AND year=${year} AND semester=${semester} AND student_id=${student_id}`;
  mysql.query(query, function(err, result){
    if(err) return res.send('FAIL');
    else{
      return res.send('OK')
    }
  });
});

router.post('/register/remove', function(req, res, next){
  var course_id = req.body.course_id;
  var section_id = req.body.section_id;
  var year = req.body.year;
  var semester = req.body.semester;
  var student_id = req.session.userID;
  console.log(student_id);
  var query1 = `SELECT * FROM undergrad_students WHERE student_id = ${student_id}`;
  mysql.query(query1, function(err, result1){
    if(err){
      console.log('NOT IN UNDERGRAD STUDENTS');
      return res.send('FAIL');
    }
    else{
      var query2 = `DELETE FROM database_project.register WHERE course_id=${course_id} \
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
});

module.exports = router;
