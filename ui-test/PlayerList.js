/* jslint node: true */
"use strict";

var webdriver = require('selenium-webdriver');
var assert = require('assert');
var Yadda = require('yadda');

//a dependency on the code to inser the data - the chance for something to go wrong more than insertion because of more code
//a question of tradeoffs
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
    var library = new Yadda.localisation.English.library(dictionary)
  
    .given("we have a team called $teamname for the season 2014 with players listed in the table", function(teamname) {
        _teamName = teamname;	
        console.log("Team name = %s", _teamName);	

//Test Data
	 //firstname	| surname	| dob			| address										| suburb		| postcode		| phone			| email			|
	 //Mile		| Jedinak	| 3 Aug 1984	| Selhurst Park Stadium Whitehorse Lane 		| London 		| SE25 6PU		| 0432299934	| mile@wk.org	|
	 //Luke		| Teal		| 3 Sep 1984	| Picmonova 9							 		| Zagreb 		| 10000			| 0442888999	| luke@wk.org	|
	 //Ed			| Argent	| 3 Oct 1984	| Picmonova 9							 		| Zagreb 		| 10000			| 0442888999	| luke@wk.org	|
        
        var pms = new Pms();

        //remove the players if they are already there
        pms.Delete(_teamName, 'Mile', 'Jedinak', function(res, err) { 
                    if (err) 
                        throw err; 
                });
        pms.Delete(_teamName, 'Luke', 'Teal', function(res, err) { 
                    if (err) 
                        throw err; 
                });
        pms.Delete(_teamName, 'Ed', 'Argent',  
                function(res, err) { 
                    if (err) 
                        throw err;
                });

        //add the new ones in - we always start with new players
        pms.AddPlayer(_teamName, 'Mile', 'Jedinak', '3 Aug 1984', 'Selhurst Park Stadium Whitehorse Lane', 'London', 'SE25 6PU', '0432299934', 'mile@wk.org',  
                function(res, err) { 
                    if (err) 
                        throw err; 
                });
        pms.AddPlayer(_teamName, 'Luke', 'Teal', '3 Sep 1984', 'Picmonova 9', 'Zagreb', '10000', '0442888999', 'luke@wk.org',  
                function(res, err) { 
                    if (err) 
                        throw err; 
                });
        pms.AddPlayer(_teamName, 'Ed', 'Argent', '3 Oct 1984', '1 Lord Street', 'Bassendean', '6022', '043209834', 'ed@wk.org',  
                function(res, err) { 
                    if (err) 
                        throw err;
                });
        
    })

    .given("I have players to list", function() {
	   console.log("Given I have an empty Player List");		     
    })

    .when("I have the details created in fixture setup", function() {
        
        var driver = this.driver;

        //TODO: Parameterize the URL
        //driver.get("http://teamzone.azurewebsites.net/AddPlayer");
        driver.get("http://localhost:3000/PlayerList");

        //wait til fully loaded before attempting to locate items
        driver.wait(function() {
            return driver.findElement(webdriver.By.name('PlayerListTable')).then(function(element) { return element !== null});
        }, 10000);

        console.log('We got the form loaded');

    })

    .then("The player list should have 3 players listed", function() {
        
        var driver = this.driver;

        //check the Player List
        if (driver.findElement(webdriver.By.name('PlayerListTable')).isDisplayed())
        {
            var playerListTable = driver.findElement(webdriver.By.name('PlayerListTable'));
            assert(playerListTable !== null, 'The Player List Table was not found');
            playerListTable.findElements(webdriver.By.tagName('tr'))
                .then(function(tableRows) {
                    assert(tableRows.length > 0, "Haven't got the table rows");
                    for (var row in tableRows) {

                        console.log('row = %s', row);
                        //var tableCells = row.findElements(webdriver.By.xpath("./*"));
                    //console.log('TableCells = %s', tableCells.length);
                    //assert(tableCells.length > 0, 'No table cells discovered');

                    }

                 });

        }
        else
        {
            assert.fail('Player List not open');
        }
    })

    return library;
})();
