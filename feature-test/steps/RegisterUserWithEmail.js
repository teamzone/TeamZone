/* jslint node: true */
"use strict";
var assert = require('assert');
var _ = require('underscore');
var English = require('yadda').localisation.English;
var ums;

module.exports = (function() {
	
  return English.library()
	
	// Background
	.given("^We visit the register user page on the site.", function(next) {	
	    ums = this.interpreter_context.ums;
	    next();
    })
    
    // Scenario 1
    .given("I choose to register with an email and a password", function(next) {
       next();
    })
	
    .when("I enter $email into the email field and $password in the password field and click the Register button", function(email, password, next) {
       var ictx = this.interpreter_context;
       ums.RegisterUser(email, password,
         function (err, value) {
		   assert.ifError(err, "Error in RegisterUser");
           //created the user - will need to remove it later - so store here for the clean up to occur
           ictx.createdUsers.push({
                       email: email,
                       password: password
           });
		   next();
        });
    })

    .then("$firstname $surname will be sent a validation email.  No other details are required until the email is validated.", function(firstname, surname, next) {
        assert(this.interpreter_context.evs.messageCount === 1, 'Expected one message to have been sent');
		next();
    })
	
	// Scenario 2
	.given("$firstname $surname is already registered on the website as $email", function(firstname, surname, email, next) {
	    //No need to set up here - the same user was registered in the previous step - Yadda will not execute out of order.  Using a Background possible, but found not quite 
	    //right for this context
	    next();
	})
	
	.when("$email is entered into the email field and $password in the password field and click the Register button", function(email, password, next) {
       var scenario_ctx = this.scenario_context;
       ums.RegisterUser(email, password,
         function (err, value) {
           assert(err.message.length > 0, 'Should be expecting an error');
           scenario_ctx.err = err;
		   next();
        });
	})
	
	.then("$firstname $surname will be told that she is already registered.  She should be told to use the login button on the home page to login", function(firstname, surname, next) {
	    assert.equal(this.scenario_context.err.message, 'User already exists', 'Expecting to be told that the user was already registered');
	    next();    
	});
	
})();
