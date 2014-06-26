var Pms = require('../lib/PlayerManagementService');

var flash = {};

exports.index = function(req, res){

  // let's fake a session variable - later it will be set during Login
  // Remove this line when this has been done
  var user = {
    firstName: 'Mike',
    surname: 'Dunn',
    teams: ['Western Knights 1st Team'],              
    primaryTeam: 'Western Knights 1st Team'
  };
  req.session.user = user;

  res.render('index', { title: 'Teamzone' });
};

//exports.index = function(req, res){
//  res.redirect('login');
//};

exports.login = function(req, res) {
  res.render('login');
};

exports.register = function(req, res) {
  res.render('register');
};

exports.PlayerList = function(req, res) {

    var pms = new Pms();
    pms.GetPlayers('Western Knights', 
            function(rows, err) {
                if (err) 
                {
                    console.log('Ooops! error in GetPlayers', err) // some kind of I/O error
                    throw err;
                }
                else
                {
                    console.log('Got the rows', rows.length) // some kind of I/O error
                    res.render('PlayerList', { title: 'Player List', 'players':rows }); 
                }
      });
    
}

exports.AddPlayer = function(req, res) {
  
  //TODO: a gate here to prevent logged in users.  Is there an Aspect-oriented way of doing this?

  // validate the input
  req.checkBody('FirstName', 'Username is required').notEmpty();
  req.checkBody('Surname', 'Password is required').notEmpty();
  req.checkBody('DOB', 'DisplayName is required').notEmpty();
  req.checkBody('Address', 'Address is required').notEmpty();
  req.checkBody('Suburb', 'Suburb is required').notEmpty();
  req.checkBody('PostCode', 'Postcode is required').notEmpty();
  req.checkBody('Phone', 'Phone is required').notEmpty();
  req.checkBody('Email', 'Email does not appear to be valid').isEmail();

  // check the validation object for errors
  var errors = req.validationErrors();

  if (errors) {
    
    flash = { type: 'alert-danger', messages: errors };
    res.redirect('AddPlayer', { flash: flash });
  
  } else {
    
    var pms = new Pms();

    pms.AddPlayer(req.body.TeamName, req.body.FirstName, req.body.Surname, req.body.DOB, req.body.Address, req.body.Suburb, req.body.PostCode, req.body.Phone, req.body.Email, function(serviceResponse, err) {

      if (err === null) {
        flash.type = 'alert-success';
        flash.messages = [{ msg: 'Player was saved!' }];
        
        pms.GetPlayers(req.body.TeamName, 
                function(rows, errGet) {
                    if (errGet) 
                    {
                        throw errGet;
                    }
                    else
                    {
                        res.render('PlayerList', { flash: flash, title: 'Player List', 'players':rows }); 
                    }
          });
      }
      else
      {      
        flash = { type: 'alert-danger', messages: err };

        res.redirect('AddPlayer', { flash: flash });
    
    }});

}};
