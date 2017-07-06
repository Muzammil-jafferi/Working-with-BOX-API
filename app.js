var express = require('express');
var nunjucks = require('nunjucks');
var session = require('express-session');
var bodyParser = require('body-parser');
var util = require('util');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
//var router = require('router');
var port = 5000;

var app = express();
app.use(express.static('public'));
app.use(fileUpload());

nunjucks.configure('view', {
    autoescape: true,
    noCache: true,
    express: app
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser)
var jsonparser = bodyParser.json();
app.use(jsonparser)
//app.use(express.cookieParser());
app.use(session({
    secret: 'login',
    resave: false,
    saveUninitialized: false,
    resave : false
    // cookie: { secure: true }
}))

app.set('view engine', 'nunjucks');
app.set('view options', { layout: false });

require('./lib/routes.js')(app);

app.listen(port);
console.log('Node listening on port %s', port); 
