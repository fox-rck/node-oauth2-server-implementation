var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config.js')
var authenticate = require('./components/oauth/authenticate')
var routes = require('./routes/index');
var users = require('./routes/users');
var clients = require('./routes/clients');
var ldap = require('./routes/ldap');
var _ = require("lodash");
var app = express();

app.use(function(req, res, next) {
  var allowedOrigins = ["http://127.0.0.1:8080","http://127.0.0.1:5000", "http://192.168.1.91:5000"];
  var origin = "http://127.0.0.1:3000";
   //console.log(req.headers.origin)
   //console.log(allowedOrigins)
  if(_.indexOf(allowedOrigins, req.headers.origin) > -1) {
    //console.log('allowed')
    origin = req.headers.origin
  }
 
  res.header("Access-Control-Allow-Origin", origin);
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (config.seedDB) { require('./components/oauth/seed'); }
if (config.seedMongoDB) { require('./components/oauth/seed-mongo'); }

/** Public Area **/

require('./components/oauth')(app)

/** Control Private through OAuth **/

app.use('/', routes);
app.use('/users', users);
app.use('/', clients);
app.use('/ldap', ldap);

app.get('/secure', authenticate(), function(req,res){
  res.json({message: 'Secure data'})
});

app.get('/me', authenticate(), function(req,res){
  res.json({
    me: req.user,
    messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
    description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
    more: 'pass `profile` scope while Authorize'
  })
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
