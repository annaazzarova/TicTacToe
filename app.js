var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var HttpError = require('error').HttpError;
var errorhandler = require('errorhandler');
var mongoose = require('mongoose');
var session = require('express-session');
var config = require('config');

var log = require('libs/log')(module);

var index = require('./routes/index');

var app = express();

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var  MongoStore = require('connect-mongo')(session);
mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));

app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));


app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// error handler
app.use(function(err, req, res, next) {
    if (typeof err == 'number') {
        err = new HttpError(err);
    }

    if (err instanceof  HttpError) {
        res.sendHttpError(err);

    } else {
        if (app.get('env') == 'development') {
            errorhandler()(err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

/*
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
*/

module.exports = app;
