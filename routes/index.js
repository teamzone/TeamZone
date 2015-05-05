/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('login');
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
