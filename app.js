var logger = require("./utils/logger");
var express = require('express');
var path = require('path');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var routes = require('./routes');
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(expressValidator([]));
app.use(cookieParser());
app.use(expressSession({ secret: 'sauce', saveUninitialized: true, resave: true }));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
if ('development' == app.get('env')) {
    app.use(errorHandler());
}
app.use(morgan("combined", { "stream": logger.stream }));
function restrict(req, res, next) {
    if (req.session.authenticated) {
        next();
    }
    else {
        res.redirect('/');
    }
}
var DiConfig = require('./DiConfig');
var diConfig = new DiConfig(app);
diConfig.configureDependencies();
var RouteConfig = require('./RouteConfig');
var routeConfig = new RouteConfig(app);
routeConfig.registerRoutes();
app.route('/').get(routes.index);
app.route('/AddPlayer').get(routes.addPlayer).post(routes.AddPlayer);
app.route('/dashboard').get(restrict, routes.dashboard);
app.route('/logout').get(routes.logout);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
//# sourceMappingURL=app.js.map