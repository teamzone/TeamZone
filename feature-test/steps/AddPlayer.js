/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var assert = require('assert');
var English = require('yadda').localisation.English;
var Pms = require('../../lib/PlayerManagementService'); // The library that you wish to test

module.exports = (function () {

  return English.library()
	
	.given("^we have a team called $teamname for the season $year with no players listed", function(teamname, year, next) {	 
        this.ctx.teamname = teamname;
        this.ctx.year = year;
        next();
    })

    .given("I have an empty Player List", function(next) {
       next();
    })
	
    .when("I enter vital details $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email, next) {
       
       //save these to be checked later
	   this.ctx.firstname = firstname;
	   this.ctx.surname = surname;
	   this.ctx.dob = dob;
	   this.ctx.address = address;
	   this.ctx.suburb = suburb;
	   this.ctx.postcode = postcode;
       this.ctx.phone = phone;
       this.ctx.email = email;

       var pms = new Pms();
	   pms.Open(null, null);	   	
       pms.AddPlayer(this.ctx.teamname, firstname, surname, dob, address, suburb, postcode, phone, email,
                 function (err, value) {
                    
					if (err) 
					{
						console.log('Ooops!', err) // some kind of I/O error
						assert(1 === 0, "Error in AddPlayer");
					}
                    else
                    {	
					   next();
				    }
                 });
  	   	   
    })

    .then("The player list should have 1 player listed", function(next) {
        console.log('then');

        var teamname = this.ctx.teamname;
        var firstname = this.ctx.firstname;
	    var surname = this.ctx.surname;
	    var dob = this.ctx.dob;
	    var address = this.ctx.address;
	    var suburb = this.ctx.suburb;
	    var postcode = this.ctx.postcode;
        var phone = this.ctx.phone;
        var email = this.ctx.email;

        console.log('Getplayer to be called on %s %s %s', teamname, firstname, surname);

        var pms = new Pms();
	    pms.Open(null, null);
        pms.GetPlayer(teamname, firstname, surname, 
                function (err, value) {
                   
				    if (err) 
				    {
					    console.log('Ooops!', err) // some kind of I/O error
					    assert(1 === 0, "Error in GetPlayer");
				    }
				   	else
                    {                                                                                                               				   
 				       assert(value != null, "No value returned");
				   		
                       assert.equal(teamname, value.teamname, "teamname does not match");
                       assert.equal(firstname, value.firstname, "firstname does not match");
                       assert.equal(surname, value.surname, "surname does not match");                                                                                           			   					   
					   assert.equal(dob, value.dob, "dob does not match");
					   assert.equal(address, value.address, "address does not match");
					   assert.equal(suburb, value.suburb, "suburb does not match");
					   assert.equal(postcode, value.postcode, "postcode does not match ");
					   assert.equal(phone, value.phone, "phone does not match ");
                       assert.equal(email, value.email, "email does not match ");					   

					   next();
                    }
				});
    })
	
    .given("I have a Player List with the following details $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email, next) {
       
        //save the details for the next part of the test 
	   this.ctx.firstname = firstname;
	   this.ctx.surname = surname;
	   this.ctx.dob = dob;
	   this.ctx.address = address;
	   this.ctx.suburb = suburb;
	   this.ctx.postcode = postcode;
       this.ctx.phone = phone;
       this.ctx.email = email;

       //we are using our own API aware of the tradeoff here
       var pms = new Pms();
	   pms.Open(null, null);	   	
       pms.AddPlayer(this.ctx.teamname, firstname, surname, dob, address, suburb, postcode, phone, email,
                 function (err, value) {
                    
					if (err) 
					{
						console.log('Ooops!', err) // some kind of I/O error
						assert(1 === 0, "Error in AddPlayer");
					}
                    else
                    {		                       			   					   					   					   
					   next();
				    }
                 });
    })

    .when("I enter those details again", function(next) {
       var pms = new Pms();
	   pms.Open(null, null);	 
       var ctx = this.ctx;
       pms.AddPlayer(this.ctx.teamname, this.ctx.firstname, this.ctx.surname, this.ctx.dob, this.ctx.address, this.ctx.suburb, this.ctx.postcode, this.ctx.phone, this.ctx.email,
                 function (err, value) {                    
					if (err) 
					{
                        //gonna save the error and check it in the then clause
                        ctx.Error = err;
                        next();
					}
                    else
                    {		
                       assert(1 === 0, "Failed: Should have been an error");                        			   					   					   					   
				    }
                 });        
    })

    .then("saving should not be permitted and the user notified", function(next) {
        assert(this.ctx.Error !== null, "Where's the error?");
        assert(this.ctx.Error.message, 'Cannot add this player, the player already exists', 'Incorrect error message');
        next();
    })

    .given("As a coach", function(next) {
        next();
    })

    .when("I attempt to enter the following details which contains an incorrect date $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email, next) {

       this.ctx.firstname = firstname;
	   this.ctx.surname = surname;
       var ctx = this.ctx;
       var pms = new Pms();
	   pms.Open(null, null);	 
       pms.AddPlayer(this.ctx.teamname, firstname, surname, dob, address, suburb, postcode, phone, email,
                 function (err, value) {                    
					if (err) 
					{
                        //gonna save the error and check it in the then clause
                        ctx.Error = err;
                        next();
					}
                 }); 
    })

    .then("I should be notified of an invalid date", function(next) {
        assert.equal(this.ctx.Error.message, 'The date is in an incorrect format', 'Incorrect error message');

        var pms = new Pms();
	    pms.Open(null, null);
        console.log('Checking not row exists for %s %s %s', this.ctx.teamname, this.ctx.firstname, this.ctx.surname);
        pms.GetPlayer(this.ctx.teamname, this.ctx.firstname, this.ctx.surname, 
                function (err, value) {
                    assert(err !== null, 'We want an error to have been returned to show that the row doesn not exist');
                    assert(err.notFound, 'Got the wrong error message')
                    next();
				});

    });

})();
