/* jslint node: true */
"use strict";

var Pms = require('../../../lib/PlayerManagementService');
var webdriver = require('selenium-webdriver');
var assert = require('assert');
var Yadda = require('yadda');

module.exports = (function() {

    var library = new Yadda.localisation.English.library()
    
	.given("^we have a team called $teamname for the season $year with no players listed", function(teamname, year) {
        this.teamname = teamname;
        this.year = year;
    })

    .given("I have an empty Player List", function() {
    })

    .when("I enter vital details $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email) {
	   StandardAddPlayerFormFill(this.driver, this.teamname, firstname, surname, dob, address, suburb, postcode, phone, email);   
    })

    .then("The player list should have $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email listed", function(firstname, surname, dob, address, suburb, postcode, phone, email) {
        
        var teamname = this.teamname;
        var pms = new Pms();
	    pms.Open(null);
        pms.GetPlayer(teamname, firstname, surname, 
                function (err, value) {
                   
				    if (err) 
				    {
					    console.log('Ooops!', err) // some kind of I/O error
					    assert(1 == 0, "Error in GetPlayer");
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

                    }
				});
           
    })

    .given("As a coach or administrator who wants to Add Players", function() {
        //need to set up from sort of fake to throw an error

    })

    .when("an error occurs when submitting these valid player details $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email) {
        StandardAddPlayerFormFill(this.driver, this.teamname, firstname, surname, dob, address, suburb, postcode, phone, email);
    })

    .then("the user should be notified with the message 'A failure occurred whilst saving the player. Please try again'", function(next) {
        assert.fail(1, 0, 'Need to fill this in');
    })

    function StandardAddPlayerFormFill(driver, teamname, firstname, surname, dob, address, suburb, postcode, phone, email)
    {
       //TODO: Parameterize the URL
       driver.get(process.env.TEAMZONE_URL + '/addPlayer');

       //wait til fully loaded before attempting to locate items
       driver.wait(function() {
            return driver.findElement(webdriver.By.name('TeamName')).then(function(element) { return element !== null});
       }, 10000);

       driver.findElement(webdriver.By.name('TeamName'))
            .then(function(teamNameElement) {

                driver.findElement(webdriver.By.name('TeamName')).sendKeys(teamname);
                driver.findElement(webdriver.By.name('FirstName')).sendKeys(firstname);
                driver.findElement(webdriver.By.name('Surname')).sendKeys(surname);
                driver.findElement(webdriver.By.name('DOB')).sendKeys(dob);
                driver.findElement(webdriver.By.name('Address')).sendKeys(address);
                driver.findElement(webdriver.By.name('Suburb')).sendKeys(suburb);
                driver.findElement(webdriver.By.name('PostCode')).sendKeys(postcode);
                driver.findElement(webdriver.By.name('Phone')).sendKeys(phone);
                driver.findElement(webdriver.By.name('Email')).sendKeys(email.trim());
                driver.findElement(webdriver.By.name('Submit')).click();

                return true;
        })
        .then(null, function(err) {
            console.error("An error was thrown! " + err);
            assert.ifError(err);
        });

    }

    return library;
})();
