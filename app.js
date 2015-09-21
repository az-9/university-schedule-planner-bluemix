if (process.env.NEW_RELIC_LICENSE_KEY) {
    console.log("newrelic activating");
    require('newrelic');
}

//process.env.NODE_ENV="development";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var scheduleplanner = require('./routes/scheduleplenner.js');


var app = express();

// ddos

/*
var Ddos = require('ddos');
var params = {};
params.errormessage = "error: too many requests";
var ddos = new Ddos(params);
app.use(ddos.express);
*/


// view engine setup
//app.set('views', path.join(__dirname, '/views'));
//app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/scheduleplanner', scheduleplanner);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 404);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

console.log('process.env.PORT :'+process.env.PORT );

function isIojs(callback) {
    require('child_process').exec(process.execPath + ' -h', function(err, help) {
        return err ? callback(err) : callback(null, /iojs\.org/.test(help));
    });
};

isIojs(function(er,isit){
    console.log('is iojs ? '+ isit );

});


var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Express server listening on port ' + port);
});
