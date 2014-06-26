/* jslint node: true */
"use strict";

var webdriver = require('selenium-webdriver');
var assert = require('assert');
var Yadda = require('yadda');
var Pms = require('../lib/PlayerManagementService');

module.exports = (function() {

  var wordExpression = /(.*)/;
  
  var dictionary = new Yadda.Dictionary()
	.define('firstName', wordExpression)
	.define('surname', wordExpression)
	.define('dob', wordExpression)
	.define('address', wordExpression)
	.define('postcode', wordExpression)
	.define('phone', wordExpression)
    .define('email', wordExpression)
    .define('suburb', wordExpression);

    var _teamName;
    var _surname;
    var _firstname;
    var _dob;
    var _address;
    var _suburb;
    var _phone;
    var _email;
    var _postcode;

    var library = new Yadda.localisation.English.library(dictionary)
    
	.given("we have a team called $teamname for the season 2014 with no players listed", function(teamname) {
        _teamName = teamname;	
        console.log("Team name = %s", _teamName);	
    })

    .given("I have an empty Player List", function() {
	   console.log("Given I have an empty Player List");		     
    })

    .when("I enter vital details $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email) {
        
        _firstname = firstname;
        _surname = surname;
        _dob = dob;
        _address = address;
        _suburb = suburb;
        _postcode = postcode;
        _phone = phone;
        _email = email;

        console.log("Enter details into form %s %s %s %s %s %s %s, %s", firstname, surname, dob, address, suburb, postcode, phone, email);

        var driver = this.driver;

        //TODO: Parameterize the URL
        //driver.get("http://teamzone.azurewebsites.net/AddPlayer");
        driver.get("http://localhost:3000/AddPlayer");

        //wait til fully loaded before attempting to locate items
        driver.wait(function() {
            return driver.findElement(webdriver.By.name('TeamName')).then(function(element) { return element !== null});
        }, 10000);

        console.log('We got the form loaded');

        driver.findElement(webdriver.By.name('TeamName')).
            then(function(teamNameElement) {
                //teamNameElement = driver.findElement(webdriver.By.name('TeamName'));
                console.log('Got the teamName element %s', teamNameElement);
                //Line refactored to check it's been initialized to _teamName
                //driver.findElement(webdriver.By.name('TeamName')).sendKeys(_teamName);
                var teamNameValue = teamNameElement.getAttribute('value');
                assert.equal(_teamName, teamNameValue, 'Value has not been set to ' + teamNameValue);

                driver.findElement(webdriver.By.name('FirstName')).sendKeys(firstname);
                driver.findElement(webdriver.By.name('Surname')).sendKeys(surname);
                driver.findElement(webdriver.By.name('DOB')).sendKeys(dob);
                driver.findElement(webdriver.By.name('Address')).sendKeys(address);
                driver.findElement(webdriver.By.name('Suburb')).sendKeys(suburb);
                driver.findElement(webdriver.By.name('PostCode')).sendKeys(postcode);
                driver.findElement(webdriver.By.name('Phone')).sendKeys(phone);
                driver.findElement(webdriver.By.name('Email')).sendKeys(email);
                driver.findElement(webdriver.By.name('Submit')).click();

                console.log('should wait for the page to redirect');

//This is creating a dependency on PlayerList - therefore no independent - can we live with this?
//This can be discussion point
//Options: Have the dependency? Have another way to check?  Some other option?  Can it vary from project to project? Keep it Simple?

                var playerListTitle = null;
                //after submit we should successfully navigate to player list page
                driver.wait(function() {
                        return driver.getTitle().then(function(title) {
                            console.log('Title = %s', title);
                            playerListTitle = title;
                            return title.indexOf('Player List') > -1;
                        });
                }, 10000);

            }).
            then(null, function(err) {
                console.error("An error was thrown! " + err);
                assert.ifError(err);
            });
    })

    .then("The player list should have 1 player listed", function() {
        console.log('Then the player list should have 1 player listed');
        
//Delimenna - this is atcually testing another story - not an independent test - therefore checking the contents is another test
//So is is worth checking here?
//Probably not - PlayerList will have it's own check.  Any error there will be caught by that test
//TODO: Decide how to verify this
// go direct to the data source without accessing intermediaries?
// tradeoffs
        var pms = new Pms();
        var playerObject = pms.GetPlayer(_teamName, _firstname, _surname, function (value, err) {
					   if (err) 
					   {
						 console.log('Ooops!', err) // some kind of I/O error
					     assert(1 == 0, "Error in GetPlayer");
					   }
					   					   
					   assert(value != null, "No value returned");
					   
					   //the result is returned as a JSON string
					   var playerObject = JSON.parse( value );
					   					   
					   assert(_dob == playerObject.dob);
					   assert(_address == playerObject.address, "address does not match");
					   assert(_suburb == playerObject.suburb);
					   assert.equal(_postcode, playerObject.postcode, "postcode does not match ");
                       assert.equal(_phone, playerObject.phone, "phone does not match ");					   					   
                       assert.equal(_email, playerObject.email, "email does not match ");

				    });

        //var driver = this.driver;

        //check the Player List
        //driver.get("http://localhost:3000/PlayerList");
        //var playerListTable = driver.findElement(webdriver.By.name('PlayerListTable'));
        //assert(playerListTable !== null, 'Player List Table not located');
        //var tableCells = playerListTable.findElements(webDriver.By.xpath("id('testTable')/tbody/tr"));
        //assert(tableCells.length > 0, 'No table cells discovered');
    })

    return library;
})();
