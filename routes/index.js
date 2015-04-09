var playermanagementservice = require('../lib/PlayerManagementService');
var databasefactory = require('../lib/common/DatabaseFactory');

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
  
    var dbf = new databasefactory(),
        database = dbf.levelredis(),
        playersDb = dbf.playerdb(database.leveldb);

    var pms = new playermanagementservice();
    pms.Open(playersDb);
        
    pms.AddPlayer(req.body.TeamName, req.body.FirstName, req.body.Surname, req.body.DOB, req.body.Address, req.body.Suburb, req.body.PostCode, req.body.Phone, req.body.Email, 
        function(err, serviceResponse) {
            if (err) {
                res.redirect('addPlayer', err);
            }
            else {
                res.render('index', { title: 'Express' });
            }
            database.redis.quit();
            database.leveldb.close();
        });

};

exports.dashboard = function(req, res) {
  res.render('dashboard', { user: req.session.user });
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
