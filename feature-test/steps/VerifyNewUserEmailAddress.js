var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');

module.exports = (function() {
	
  var ums;
  var createdUsers;
  
  return English.library()
	
	.given("The user $firstname $lastname has already registered on TeamZone with email address $email.", function(firstname, lastname, email, next) {	
	    ums = this.interpreter_context.ums;
	    createdUsers = this.interpreter_context.createdUsers;
	    var dbh = new dbhelpers();
        var tokenHash = this.interpreter_context.token.generate(email);
        dbh.CreateUser(this.interpreter_context.usersDb, this.interpreter_context.createdUsers, firstname, lastname, 'password not relevant', email, tokenHash, false, next);
    })
    
    .given("that $firstname $lastname clicks on the link and open a browser to navigate to the link", function(firstname, lastname, next) {
       // no browser here - API Level    
       next();
    })
	
    .when("the browser sends the request to TeamZone", function(next) {
       next();
    })

    .then("$firstname $surname is confirmed as a real user", function(firstname, surname, next) {
        //simulate the browser sending the request into the API
        
        var token = createdUsers[createdUsers.length - 1].token;
        var email = createdUsers[createdUsers.length - 1].email;
        ums.ConfirmRegisterUser(email, token, function(err) {
            if (err)
                next(err);
            else {
        		next();
            }
        });

    })
    
    .then("should be notified in the browser that they have successfully registered", function(next) {
        //no browser at this level
        next();
    })
    
    .then("receive an email confirming this", function(next) {
        next();
    })
	
	.then("can now access the site", function(next) {
	    //check the contents of the user in the database - hmmmm starting to feel uncomfortable with direct db access again
	    var dbh = new dbhelpers();
	    var createdUser = createdUsers[createdUsers.length - 1];
        dbh.GetUser(this.interpreter_context.usersDb, createdUser.email, function(err, value) {
            if (err)
                next(err);
            else {
                //no object euality is Javascript???  Check or introduce Typescript
                assert.equal(value.email, createdUser.email, 'email should still be available after confirming the user');
                assert(value.password !== null, 'Password should still be available after confirming the user');
                assert.equal(value.token, createdUser.token, 'token should still be available after confirming the user');
                assert(value.confirmed, 'user should be confirmed');
                next();
            }
        });	    
	})
	
})();
