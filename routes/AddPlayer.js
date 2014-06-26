
/*
 * GET home page.
 */

exports.AddPlayer = function(req, res){
  res.render('AddPlayer', { title: 'Add a Player' });
};