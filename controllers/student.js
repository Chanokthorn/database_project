var express = require('express');
var router = express.Router();
var mysql = require('../config/mysql');

router.get('/', function (req, res, next) {
  mysql.query("SELECT * FROM students", function (err, result) {
    if (err) console.error(err);
    else res.send(result);
  });
});

router.post('/register/remove', function(req, res, next){
  req.session.userID = 456487;
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
