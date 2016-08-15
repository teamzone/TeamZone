/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('/dashboard');
};

/* 
 * GET logout
 */

exports.logout = function(req, res) {

  // clear the session object
  req.session.destroy(function(err) {
    if(!err) {
      res.redirect('login');
    }
  });

  // log the user out via via our API, but don't wait for it

};
