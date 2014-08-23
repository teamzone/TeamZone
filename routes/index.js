
var Pms = require('../lib/PlayerManagementService');

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
  
    var pms = new Pms();
    pms.Open(null);
        
    pms.AddPlayer(req.body.TeamName, req.body.FirstName, req.body.Surname, req.body.DOB, req.body.Address, req.body.Suburb, req.body.PostCode, req.body.Phone, req.body.Email, 
        function(err, serviceResponse) {
            if (err) {
                res.redirect('addPlayer');
            }
            else {
                res.render('index', { title: 'Express' });
            }
        });

};
