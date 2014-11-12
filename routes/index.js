var playermanagementservice = require('../lib/PlayerManagementService');
var servicefactory = require('../lib/common/ServiceFactory');

// place holder for messages to send to the UI
var flash = {};

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('login');
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

exports.dashboard = function(req, res) {
  res.render('dashboard', { user: req.session.user });
};

/*
 * GET login page.
 */

exports.login = function(req, res) {
  res.render('login');
};

/* 
 * GET logout
 */

exports.logout = function(req, res) {

  // clear the session object
  req.session.destroy();

  // log the user out via via our API, but don't wait for it

  res.redirect('login');
};

/*
 * GET register page.
 */

exports.register = function(req, res) {
  res.render('register');
};

/*
 * Post loginUser
 */
exports.loginUser = function(req, res) {
  
  // pull the form variables off the request body
  var username = req.body.username;
  var password = req.body.password;
  //This will be injected eventually
  var sf = new servicefactory();
  var ums = sf.CreateUserManagementService();
  
  // register the user with everlive
  ums.LoginUser(username, password, function(err, reslogin) {
    if (err) {
        // failure
        flash.type = 'alert-danger';
        flash.messages = [{ msg: err.message }];
        res.render('login', { flash: flash });
    }
    else {
      // success
      console.log(reslogin);
      if (reslogin.loggedIn) {
      
        req.session.authenticated = true;
        req.session.user = reslogin;

        res.redirect('dashboard');
      } 
      else {
        flash.type = 'alert-info';
        flash.messages = [{ msg: 'Login failed.  You may need to still verify your account or incorrect username/password was entered' }];
        res.render('login', { flash: flash });
      }
    }
  });
};
  
/*
* POST register user.
*/
exports.registerUser = function(req, res) {
      
    // validate the input
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email does not appear to be valid').isEmail();
    
    // check the validation object for errors
    var errors = req.validationErrors();
    
    if (errors) {
        
      flash = { type: 'alert-danger', messages: errors };
      res.redirect('register');
      
    } else {
        
        // pull the form variables off the request body
        var username = req.body.email;
        var password = req.body.password;

        //This will be injected eventually
        var sf = new servicefactory();
        var ums = sf.CreateUserManagementService();
  
        ums.RegisterUser(username, password, function(err, resregister) {
          if (err) {
            // failure
          
            flash.type = 'alert-danger';
            flash.messages = [{ msg: err.message }];
    
            res.render('register', { flash: flash });
  
          }
          else {
            // success
          
            flash.type = 'alert-success';
            flash.messages = [{ msg: 'Please check your email to verify your registration. Then you will be ready to log in!' }];
    
            res.render('login', { flash: flash });
    
          }
          
        
        });
      }
};