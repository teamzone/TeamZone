var assert = require('assert');
var English = require('yadda').localisation.English;
var usermanagementservice = require('../../lib/UserManagementService'); // The library that you wish to test
var bcrypt = require('bcrypt');
var moment = require('moment');

module.exports = (function() {
	
  var ums;

  return English.library()
	
	.given("^We visit the home page of the site and wish to login through the login area.  We are dependent on the user $email $firstname, $surname, $password being registered on the system.", function(email, firstname, surname, password, next) {	
        
        this.interpreter_context.createdUsers[this.interpreter_context.createdUsers.length] = {
                    email: email,
                    firstname: firstname,
                    surname: surname,
                    password: password
        };
        
	    //Set up the fake user - maybe this is in the runner. Going direct? Use Regsiter API?  With the API we needn't bother with hash
	    
	    ums = this.interpreter_context.ums;
	    //direct code to DB
	    var usersDb = this.interpreter_context.usersDb;
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hashedPassword) {
                // Store hash in your password DB.
                usersDb.put(email, { firstname: firstname, surname: surname, email: email, password: hashedPassword }, { sync: true }, 
            				        function (err) {
            					        if (err) 
                                            next(err);
                                        else
                                            //it worked nothing to return
                                            next();
            			            });	    
                
            });
        });
				            
    })
    
    .given("We are on on the home page", function(next) {
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


})();
