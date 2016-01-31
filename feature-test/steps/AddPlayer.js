/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var assert = require('assert');
var English = require('yadda').localisation.English;

module.exports = (function () {

  return English.library()
	
	.given("^we have a team called $clubname for the season $season with no players listed playing in the city of $city", function(clubname, season, cityname, next) {	 
        this.interpreter_context.clubname = clubname;
        this.interpreter_context.season = season;
        this.interpreter_context.cityname = cityname;
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

       var pms = this.interpreter_context.pms;
       var createdPlayers = this.interpreter_context.createdPlayers;
       var clubname = this.interpreter_context.clubname;
       var cityname = this.interpreter_context.cityname;
       pms.AddPlayer(clubname, cityname, firstname, surname, dob, address, suburb, postcode, phone, email,
                 function (err, value) {
                    if (err) {
                        assert.fail(err, undefined, "Error in adding the player back with error: " + err.message);
                    }
                    createdPlayers.push({ club: clubname, city: cityname, email: email });
					next();
                 });
  	   	   
    })

    .then("The player list should have 1 player listed", function(next) {

        var ctx = this.ctx,
            interpreter_context = this.interpreter_context,
            clubname = interpreter_context.clubname,
            cityname = interpreter_context.cityname;

        interpreter_context.pms.GetPlayer(clubname, cityname, ctx.email, 
            function (err, value) {
                if (err) {
                    assert.fail(err, undefined, "Error in getting the player back with error: " + err.message);
                }
 		        assert(value != null, "No value returned");
		   		
                assert.equal(value.clubname, clubname, "clubname does not match");
                assert.equal(value.cityname, cityname, "cityname does not match");
                assert.equal(value.firstname, ctx.firstname, "firstname does not match");
                assert.equal(value.lastname, ctx.surname, "lastname does not match");                                                                                           			   					   
			    assert.equal(value.dob, ctx.dob, "dob does not match");
			    assert.equal(value.address, ctx.address, "address does not match");
			    assert.equal(value.suburb, ctx.suburb, "suburb does not match");
			    assert.equal(value.postcode, ctx.postcode, "postcode does not match ");
			    assert.equal(value.phone, ctx.phone, "phone does not match ");
                assert.equal(value.email, ctx.email, "email does not match ");					   

			    next();
			});
    })
	
	//scenario 2
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
       var pms = this.interpreter_context.pms;
       var createdPlayers = this.interpreter_context.createdPlayers,
           clubname = this.interpreter_context.clubname,
           cityname = this.interpreter_context.cityname;
       pms.AddPlayer(clubname, cityname, firstname, surname, dob, address, suburb, postcode, phone, email, function (err, value) {
            if (err) {
                assert.fail(err, undefined, "Error in adding the player back with error: " + err.message);
            }
            createdPlayers.push({ club: clubname, city: cityname, email: email });
			next();
        });
    })

    .when("I enter those details again", function(next) {
	   var pms = this.interpreter_context.pms,
           ctx = this.ctx,
           clubname = this.interpreter_context.clubname,
           cityname = this.interpreter_context.cityname;     
       pms.AddPlayer(clubname, cityname, ctx.firstname, ctx.surname, ctx.dob, ctx.address, ctx.suburb, ctx.postcode, ctx.phone, ctx.email,
                 function (err, value) {                    
					if (err) {
                        //gonna save the error and check it in the then clause
                        ctx.Error = err;
                        next();
					} else {		
					   createdPlayers.push({ club: clubname, city: cityname, email: email });
                       assert(false, "Failed: Should have been an error");  
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

    // Scenario 3
    .when("I attempt to enter the following details which contains an incorrect date $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email, next) {

	   var pms = this.interpreter_context.pms,
           ctx = this.ctx,
           createdPlayers = this.interpreter_context.createdPlayers,
           clubname = this.interpreter_context.clubname,
           cityname = this.interpreter_context.cityname;  
       ctx.email = email;
       pms.AddPlayer(clubname, cityname, firstname, surname, dob, address, suburb, postcode, phone, email,
                 function (err, value) {                    
					if (err) {
                        //gonna save the error and check it in the then clause
                        ctx.Error = err;
                        next();
					} else {
    					// might have been saved, we can clean that up
    					createdPlayers.push({ club: clubname, city: cityname, email: email });
    				    assert(false, "Failed: Should have been an error with date processing");  
					}
                 }); 
    })

    .then("I should be notified of an invalid date", function (next) {
        assert.equal(this.ctx.Error.message, 'The date is in an incorrect format', 'Incorrect error message');
        next();
    })
    
    .then("the player should not be in the database", function (next) {
        var pms = this.interpreter_context.pms,
            ctx = this.ctx,
            clubname = this.interpreter_context.clubname,
            cityname = this.interpreter_context.cityname; 
        
        pms.GetPlayer(clubname, cityname, ctx.email, 
                function (err, value) {
                    assert(err !== null, 'We want an error to have been returned to show that the row doesn not exist');
                    assert(err.notFound, 'Got the wrong error message');
                    next();
				});
    });

})();
