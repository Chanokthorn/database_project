var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var cors = require('cors');

var mysql = require('./config/mysql');
mysql.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

var authController = require('./controllers/auth');
var studentController = require('./controllers/student');
var instructorController = require('./controllers/instructor');
var courseController = require('./controllers/course');
var generateController = require('./controllers/generate');

var app = express();

app.use(cors({
  origin: 'http://localhost:4000',
  methods:['GET','POST'],
  credentials: true
}));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "*");
//   next();
// });

app.use(cookieSession({
  name: 'session',
  keys: ['I', 'Love', 'Database','userID','isLogin','userType'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authController);
app.use('/student', studentController);
app.use('/instructor', instructorController);
app.use('/course', courseController);
app.use('/generate', generateController);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.set('trust proxy',1);
app.use(cookieSession({
  name:'session',
  keys:['userID', 'isLogin'],
  maxAge: 24 * 60 * 60 * 1000
}));
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;