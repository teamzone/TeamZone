var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');
var tms;
var clubname;
var squadname;
var agelimit;
var cityname;
var email;
var season;

module.exports = (function() {
	
  return English.library()
	
	// Background
	.given("The user $firstname $lastname is logged into the site and is an administrator for the club $club in $city playing at $field in $suburb for the current season.", 
	  function(firstname, lastname, club, city, field, suburb, next) {	
	    clubname = club;
	    cityname = city;
	    tms = this.interpreter_context.tms;
	    var today = new Date();
        season = today.getFullYear().toString();
	    var createdUsers = this.interpreter_context.createdUsers;
	    var createdClubs = this.interpreter_context.createdClubs;
	    var usersDb = this.interpreter_context.usersDb;	
	    var clubsDb = this.interpreter_context.clubsDb;
	    var dbh = new dbhelpers();
	    // create the sample user, making up the password and email address as being declarative in the feature makes it a bit easier to manage. Email is the key
	    email = firstname + '.' + lastname + '@' + 'gmail.com';
        // create the sample club name
        dbh.CreateClub(clubsDb, createdClubs, club, city, field, suburb, email, next, false);
        dbh.CreateUser(usersDb, createdUsers, firstname, lastname, 'SomePassword', email, '', true, next);
    })
    
    // Scenario 1
    .given("User gives the squad name $squadname and an age limit of $agelimit", function(squad, age, next) {
       squadname = squad;
       agelimit = age;
       next();
    })
	
    .when("the squad is saved", function(next) {
       var createdSquads = this.interpreter_context.createdSquads;
       // these are needed in the nested callback function
       var club = clubname;
       var city = cityname;
       var squad = squadname;
       var s = season;
       tms.CreateSquad(clubname, cityname, squadname, season, agelimit, email,          
            function (err, value) {
                assert.ifError(err, "Error in CreateSquad");
                //saving the created club for cleaning up later on
                createdSquads.push({ clubname: club, cityname: city, squadname: squad, season: s });
			    next();
            });
    })

    .then("the user will also be marked as the creator of the squad", function(next) {
        var dbh = new dbhelpers();
        dbh.GetSquad(this.interpreter_context.squadsDb, clubname, cityname, squadname, season, function(err, res) {
            assert.ifError(err, "Error in getting the squad back");
            assert.equal(res.admin, email, 'creator should have been set to ' + email + ' instead it was ' + res.admin);
            assert.equal(res.agelimit, agelimit , 'fieldname should have been set to ' + agelimit + ' instead it was ' + res.agelimit);
            next();
        });
    });
    
})();
