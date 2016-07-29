/// <reference path='typings/tsd.d.ts' />
/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/express/express.d.ts' />
/// <reference path='typings/express-validator/express-validator.d.ts' />
/// <reference path='typings/body-parser/body-parser.d.ts' />
/// <reference path='typings/cookie-parser/cookie-parser.d.ts' />
/// <reference path='typings/express-session/express-session.d.ts' />
/// <reference path='typings/errorhandler/errorhandler.d.ts' />
/// <reference path='typings/morgan/morgan.d.ts' />
/// <reference path='typings/method-override/method-override.d.ts' />

var logger = require("./utils/logger");
var authenticationMiddleware = require('./utils/authenticationMiddleware');
var noCacheMiddleware = require('./utils/noCacheMiddleware');
import http = require('http');
import express = require('express');
import path = require('path');
import expressValidator = require('express-validator');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import expressSession = require('express-session');
import errorHandler = require('errorhandler');
import morgan = require('morgan');
import methodOverride = require('method-override');

var favicon = require('serve-favicon');
var routes = require('./routes');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// override with different headers; last one takes precedence
app.use(methodOverride('X-HTTP-Method'))          // Microsoft
app.use(methodOverride('X-HTTP-Method-Override')) // Google/GData
app.use(methodOverride('X-Method-Override'))      // IBM
app.use(expressValidator([]));
app.disable('etag');

// add session support!
app.use(cookieParser());
app.use(expressSession({ secret: 'sauce', saveUninitialized: true, resave: true}));
app.use(function(req, res, next) {
  res.locals.query = req.query;
  next();
})
  
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Uncomment this line to demo basic auth
// app.use(express.basicAuth((user, password) => user == "user2" && password == "password"));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.use(morgan("combined", { "stream": logger.stream }));

var DiConfig = require('./DiConfig');
var diConfig = new DiConfig(app);
diConfig.configureDependencies();

var RouteConfig = require('./RouteConfig');
var routeConfig = new RouteConfig(app);
routeConfig.registerRoutes();


app.route('/')
  .get(authenticationMiddleware, routes.index);
  
app.route('/logout')
  .get(routes.logout);


app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


