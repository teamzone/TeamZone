/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');
var tms;
var clubname;
var fieldname;
var suburbname;
var cityname;
var email;

module.exports = (function () {
	
  return English.library()
	
	// Background
	.given("The user $firstname $lastname is logged into the site.", function (firstname, lastname, next) {	
	    tms = this.interpreter_context.tms;
	    var createdUsers = this.interpreter_context.createdUsers;
	    var usersDb = this.interpreter_context.usersDb;	 
	    var dbh = new dbhelpers();
	    // create the sample user, making up the password and email address as being declarative in the feature makes it a bit easier to manage. Email is the key
	    email = firstname + '.' + lastname + '@' + 'gmail.com';
        dbh.CreateUser(usersDb, createdUsers, firstname, lastname, 'SomePassword', email, '', true, next);
    })
    
    // Scenario 1
    .given("User gives the club name $club located at $addressField in the suburb $suburb in the city $city", function (club, addressField, suburb, city, next) {
       clubname = club; 
       fieldname = addressField;
       suburbname = suburb;
       cityname = city;
       next();
    })
	
    .when("the club is saved", function (next) {
       var createdClubs = this.interpreter_context.createdClubs;
       tms.CreateClub(clubname, fieldname, suburbname, cityname, email,          
            function (err, value) {
                assert.ifError(err, "Error in CreateClub");
                //saving the created club for cleaning up later on
                createdClubs.push({ clubname: clubname, cityname: cityname });
			    next();
            });
    })

    .then("the user will also be the administrator of the club", function (next) {
        var dbh = new dbhelpers();
        dbh.GetClub(this.interpreter_context.clubsDb, clubname, cityname, function (err, res) {
            assert.ifError(err, "Error in getting the club back");
            assert.equal(res.admin, email, 'admin email should have been set to ' + email + ' instead it was ' + res.admin);
            assert.equal(res.suburb, suburbname , 'suburb should have been set to ' + suburbname + ' instead it was ' + res.suburb);
            assert.equal(res.field, fieldname , 'fieldname should have been set to ' + fieldname + ' instead it was ' + res.field);
            next();
        });
    });
    
})();
