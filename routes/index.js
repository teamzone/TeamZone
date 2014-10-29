
var playermanagementservice = require('../lib/PlayerManagementService');
var usermanagementservice = require('../lib/UserManagementService');
var databasefactory = require('../lib/common/databasefactory');

// place holder for messages to send to the UI
var flash = {};

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.addPlayer = function(req, res){
  res.render('addPlayer', { title: 'Add Player' });
};

exports.AddPlayer = function(req, res) {
  
    var pms = new playermanagementservice();
    pms.Open(null);
        
    pms.AddPlayer(req.body.TeamName, req.body.FirstName, req.body.Surname, req.body.DOB, req.body.Address, req.body.Suburb, req.body.PostCode, req.body.Phone, req.body.Email, 
        function(err, serviceResponse) {
            if (err) {
                res.redirect('addPlayer', err);
            }
            else {
                res.render('index', { title: 'Express' });
            }
        });

};

/*
 * GET login page.
 */

exports.login = function(req, res) {
  res.render('login');
};

/*
 * Post loginUser
 */
exports.loginUser = function(req, res) {
  
  // pull the form variables off the request body
  var username = req.body.username;
  var password = req.body.password;
  //This will be injected 
  var database = databasefactory.levelredis();
  var ums = new usermanagementservice(null, database.userdb(database.leveldb));
  
  // register the user with everlive
  ums.LoginUser(username, password, function(err, res) {
    if (err) {
        // failure
    
        flash.type = 'alert-danger';
        flash.messages = [{ msg: err.message }];
        
        res.render('login', { flash: flash });
        
    }
    else {
      // success

      if (res.IsLoggedIn) {
      
        req.session.authenticated = true;
        req.session.user = res;

        res.redirect('dashboard');
      
      } else {

        flash.type = 'alert-info';
        flash.messages = [{ msg: 'Login failed.  You may need to still verify your account or incorrect username/password was entered' }];

        res.render('login', { flash: flash });

      }

    }
  });
  
};
