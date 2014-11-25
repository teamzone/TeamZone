/// <reference path='typings/tsd.d.ts' />
// Import express with body parsers (for handling JSON)
var express = require('express');
var servicefactory = require('./lib/common/ServiceFactory');
var sf = new servicefactory();
var ums = sf.CreateUserManagementService();
var routes = require('./routes');
// user = require('./routes/user');
var user = require('./routes/user');
var u = new user(ums);
var http = require('http');
var path = require('path');
var expressValidator = require('express-validator');
var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(expressValidator([]));
// add session support!
app.use(express.cookieParser());
app.use(express.session({ secret: 'sauce' }));
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
// Uncommend this line to demo basic auth
// app.use(express.basicAuth((user, password) => user == "user2" && password == "password"));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
function restrict(req, res, next) {
    if (req.session.authenticated) {
        next();
    }
    else {
        res.redirect('/');
    }
}
// Get
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/register', routes.register);
app.get('/AddPlayer', routes.addPlayer);
app.get('/dashboard', restrict, routes.dashboard);
app.get('/logout', routes.logout);
// POST
app.post('/AddPlayer', routes.AddPlayer);
app.post('/login', u.Login);
app.post('/register', routes.registerUser);
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
