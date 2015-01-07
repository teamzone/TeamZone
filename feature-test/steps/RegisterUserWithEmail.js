// Review: Consistency: add jslint comment
// Review: Should we use "use strict" ?
var assert = require('assert');
var English = require('yadda').localisation.English;
// Review: Can remove this line, the instance is passed in via interpreter_context.
var usermanagementservice = require('../../lib/UserManagementService'); // The library that you wish to test
var bcrypt = require('bcrypt');
var moment = require('moment');

// Review: Immediately executed function probably isn't needed; CommonJS modules hide variables like ums. To think about.
module.exports = (function() {
	
  var ums;

  return English.library()
	
	.given("^We visit the register user page on the site.", function(next) {	
	    ums = this.interpreter_context.ums;
	    // Review: Investigate whether next() needs to be called?
    })
    
    .given("We are on the register user page and choose to register with an email and a password", function(next) {
       // Review: Maybe this step isn't needed? Check review comment in feature test.
       next();
    })
	
    .when("I enter $email into the email field and $password in the password field and click the Register button", function(email, password, next) {

       var ictx = this.interpreter_context;
       ums.RegisterUser(email, password,
         function (err, value) {
            // Review: Check indenting
			if (err) 
			{
				console.log('Ooops!', err);
				// Review: Perhaps use assert.ifError?
				assert(false, "Error in RegisterUser");
			}
            else
            {	
               //created the user - will need to remove it later - so store here for the clean up to occur
               // Review: Use push() instead
               ictx.createdUsers[ictx.createdUsers.length] = {
                           email: email,
                           password: password
               };
			   next();
		    }
        });
  	   	   
    })

    .then("$firstname $surname will be sent a validation email.  No other details are required until the email is validated.", function(firstname, surname, next) {

        //checking for an email will be tricky!
        // Review: Perhaps check the message count on the fake Email Service
		next();
    })
	
})();
