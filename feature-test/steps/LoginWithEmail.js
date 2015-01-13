/* jslint node: true */
"use strict";
var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');
var ums;

module.exports = (function() {
	
  return English.library()
	
	// Background
	.given("We have the user, a coach, $email with name $firstname, surname $surname, and password $password registered on the system.", function(email, firstname, surname, password, next) {	
	    ums = this.interpreter_context.ums;
	    var createdUsers = this.interpreter_context.createdUsers;
	    var usersDb = this.interpreter_context.usersDb;	 
	    var dbh = new dbhelpers();
	    //Background is executed for each scenario - check to create the same user just the once
	    if (!dbh.UserExistsInArray(createdUsers, email)) 
            dbh.CreateUser(usersDb, createdUsers, firstname, surname, password, email, '', true, next);
	    else
	        next();
    })
    
    // Scenario 1
    .given("We are on the login page", function(next) {
       next();
    })
	
    .when("I enter $email into the login email field and $password in the password field", function(email, password, next) {
       var ctx = this.scenario_context;
       ums.LoginUser(email, password,
         function (err, value) {
            assert.ifError(err, "Error in LoginUser");
            ctx.loggedInUser = value;
			next();
        });
    })

    .then("he should be logged in successfully", function(next) {
        var ctx = this.scenario_context;
        var createdUser = this.interpreter_context.createdUsers[this.interpreter_context.createdUsers.length - 1];

        assert.equal(createdUser.firstname, ctx.loggedInUser.firstname, "firstname does not match with loggedIn user value");
        assert.equal(createdUser.surname, ctx.loggedInUser.surname, "surname does not match with loggedIn user value");                                                                                           			   					   
        assert.equal(createdUser.email, ctx.loggedInUser.email, "email does not match with loggedIn user value");					   
        assert(ctx.loggedInUser.loggedIn, "Expecting to be logged in");
                       
		next();
    })
	
    // Scenario 2
    .given("We are back on the login page", function(next) {
       next();
    })
    
    .when("I enter $email into the login email field and incorrect password $password in the password field", function(email, incorrectpassword, next) {
       
       var ctx = this.scenario_context;
       ums.LoginUser(email, incorrectpassword,
         function (err, value) {
            ctx.loginerror = err; 
			next();
		 });
    })
    
    .then("he should not be logged in", function(next) {
		next();
    })
	
    .given("notified by error message 'Incorrect Login Details Entered, please check your email and/or password'", function(next) {
        var ctx = this.scenario_context;
        assert.equal(ctx.loginerror.message, 'Incorrect Login Details Entered, please check your email and/or password', 'Should have an error message');
        next();
    });
    
})();
