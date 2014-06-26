
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , validator = require('express-validator')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(validator([]));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  // add session support! test
  app.use(express.cookieParser());
  // stick with an InMemory session for now - DB storage later
  app.use(express.session({ secret: '6BN49' }));
    
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// GET
app.get('/', routes.index);
app.get('/AddPlayer', function(req, res) {
    res.render('AddPlayer', { title: 'Add Player' })
});
app.get('/PlayerList', routes.PlayerList);

// POST
app.post('/AddPlayer', routes.AddPlayer);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
