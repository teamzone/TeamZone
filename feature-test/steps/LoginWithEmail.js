var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');

module.exports = (function() {
	
  var ums;

  return English.library()
	
	.given("^We visit the home page of the site and wish to login through the login area.  We are dependent on the user $email $firstname, $surname, $password being registered on the system.", function(email, firstname, surname, password, next) {	
	    var dbh = new dbhelpers();
        dbh.CreateUser(this.interpreter_context.usersDb, this.interpreter_context.createdUsers, firstname, surname, password, email, '', true, next);
    })
    
    .given("Our user $firstname $surname is on the Login Page", function(firstname, surname, next) {
       next();
    })
	
    .when("Enters #email into the login email field and $password in the password field", function(email, password, next) {
       
       var ctx = this.scenario_context;

    })

    .then("$firstname $surname should be logged in successfully", function(firstname, surname, next) {

        var ctx = this.scenario_context;

		next();
    })
	
    .given("be navigated away from the login page", function(next) {
        next();
    })

// Next scenario being tested
    .given("Our user $firstname $surname is on the Login Page", function(next) {
       next();
    })
    
    .when("Enters $email into the login email field and $incorrectpassword in the password field", function(email, incorrectpassword, next) {
       
       var ctx = this.scenario_context;
    })
    
    .then("$firstname $surname should not be logged in", function(firstname, surname, next) {
		next();
    })
	
    .given("be directed back to the login page with the login dialog showing error 'Incorrect Login Details Entered, please check your email and/or password'", function(next) {
        var ctx = this.scenario_context;
        next();
    })
    
})();
