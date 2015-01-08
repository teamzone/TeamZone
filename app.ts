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
app.use(methodOverride());
app.use(expressValidator([]));

// add session support!
app.use(cookieParser());
app.use(expressSession({ secret: 'sauce', saveUninitialized: true, resave: true}));
  
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Uncomment this line to demo basic auth
// app.use(express.basicAuth((user, password) => user == "user2" && password == "password"));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.use(morgan("combined", { "stream": logger.stream }));

function restrict(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/');
  }
}

var DiConfig = require('./DiConfig');
var diConfig = new DiConfig(app);
diConfig.configureDependencies();

var RouteConfig = require('./RouteConfig');
var routeConfig = new RouteConfig(app);
routeConfig.registerRoutes();

app.route('/')
  .get(routes.index);
  
app.route('/AddPlayer')
  .get(routes.addPlayer)
  .post(routes.AddPlayer);
  
app.route('/dashboard')
  .get(restrict, routes.dashboard);
  
app.route('/logout')
  .get(routes.logout);

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


