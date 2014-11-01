var assert = require('assert');
var English = require('yadda').localisation.English;
var usermanagementservice = require('../../lib/UserManagementService'); // The library that you wish to test
var bcrypt = require('bcrypt');
var moment = require('moment');

module.exports = (function() {
	
  var ums;

  return English.library()
	
	.given("^We visit the register user page on the site.", function(next) {	
	    ums = this.interpreter_context.ums;
    })
    
    .given("We are on the register user page and choose to register with an email and a password", function(next) {
       next();
    })
	
    .when("I enter $email into the email field and $password in the password field and click the Register button", function(email, password, next) {

       var ictx = this.interpreter_context;
       ums.RegisterUser(email, password,
         function (err, value) {
            
			if (err) 
			{
				console.log('Ooops!', err);
				assert(1 === 0, "Error in RegisterUser");
			}
            else
            {	
               //created the user - will need to remove it later - so store here for the clean up to occur
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
        
		next();
    })
	
})();
