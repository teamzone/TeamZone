
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('yadda', { title: 'Yadda Debug' });
};