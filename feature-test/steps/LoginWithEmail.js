var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');

module.exports = (function() {
	
  var ums;

  return English.library()
	
	.given("^We visit the home page of the site and wish to login through the login area.  We are dependent on the user $email $firstname, $surname, $password being registered on the system.", function(email, firstname, surname, password, next) {	
	    ums = this.interpreter_context.ums;
	    var dbh = new dbhelpers();
        dbh.CreateUser(this.interpreter_context.usersDb, this.interpreter_context.createdUsers, firstname, surname, password, email, '', true, next);
    })
    
    .given("We are on the home page", function(next) {
       next();
    })
	
    .when("I enter $email into the login email field and $password in the password field", function(email, password, next) {
       
       var ctx = this.scenario_context;
       ums.LoginUser(email, password,
         function (err, value) {
            
			if (err) 
			{
				console.log('Ooops!', err) 
				assert(1 === 0, "Error in LoginUser");
			}
            else
            {	
               ctx.loggedInUser = value;
			   next();
		    }
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
	
    .given("be presented with the list of teams he coaches which is $teamname", function(teamname, next) {
        //assert.equal(this.scenario_context.teams[0], teamname, 'Team was not brought back');
        next();
    })

// Next scenario being tested
    .given("We are back on the home page", function(next) {
       next();
    })
    
    .when("I enter $email into the login email field and incorrect password $password in the password field", function(email, incorrectpassword, next) {
       
       var ctx = this.scenario_context;
       ums.LoginUser(email, incorrectpassword,
         function (err, value) {
            ctx.loginerror = err; 
			next();
		 })
    })
    
    .then("he should not be logged in", function(next) {
		next();
    })
	
    .given("notified by error message 'Incorrect Login Details Entered, please check your email and/or password'", function(next) {
        var ctx = this.scenario_context;
        assert(ctx.loginerror.message === 'Incorrect Login Details Entered, please check your email and/or password', 'Should have an error message');
        //assert.equal(this.scenario_context.teams[0], teamname, 'Team was not brought back');
        next();
    })
    
})();
