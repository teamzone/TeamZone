var assert = require('assert');
var Yadda = require('yadda');
var English = require('yadda').localisation.English;
var Pms = require('../../lib/PlayerManagementService'); // The library that you wish to test

module.exports = (function() {

  var _pms;
  var _teamName;
  var _firstname;
  var _surname;
  var _dob;
  var _address;
  var _suburb;
  var _postcode;
  var _lastException;
  
  var wordExpression = /(.*)/;
  
  var dictionary = new Yadda.Dictionary()
	.define('firstName', wordExpression)
	.define('surname', wordExpression)
	.define('dob', wordExpression)
	.define('address', wordExpression)
	.define('postcode', wordExpression)
    .define('suburb', wordExpression);
	
  return English.library(dictionary)
	
	.given("^we have a team called $teamname for the season 2014 with no players listed", function(teamname, next) {
        _teamName = teamname;		
        next();
    })
	
    .given("I have an empty Player List", function(next) {
       _pms = new Pms();
	   	   
       next();
    })
	
    .when("I enter vital details $firstName, $surname, $dob, $address, $suburb, $postcode", function(firstname, surname, dob, address, suburb, postcode, next) {
	   
	   //save these to be checked later
	   _firstname = firstname;
	   _surname = surname;
	   _dob = dob;
	   _address = address;
	   _suburb = suburb;
	   _postcode = postcode;
	   
       _pms.AddPlayer(_teamName, firstname, surname, dob, address, suburb, postcode, next);
	   
       next();
	   
    })

    .then("The player list should have 1 player listed", function(next) {
	   
       //confirmation is no error was raised
	   //separate UI Test to reveal message - it's not a business logic concern
	   //however there should be some check against the database
       
	   _pms.GetPlayer(_teamName, _firstname, _surname, function (err, value) {
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
					   					   
					   next();
				    });
	   
    })
	
	.when("I ask to save some missing values $firstName, $surname, $dob, $address, $suburb, $postcode", function(firstname, surname, dob, address, suburb, postcode, next) {
	
      try {
	     _pms.AddPlayer(_teamName, firstname, surname, dob, address, suburb, postcode, next);
      }
      catch (e)
      {
         _lastException = e;
         next();
         return;
      }
	   assert.fail(1, 0, "Not expecting to have reached here.  'Next' should have been called");
	   
    })
	.then("I should be alerted that first Name, address and postcode should be entered", function(next) {
		//assert.ok(_lastException instanceof Pms.ValidationError, "Expecting the validation error type");
      assert.ok(_lastException.Errors.indexOf("firstname is not present") > -1, "address should have been validated");
      assert.ok(_lastException.Errors.indexOf("address is not present") > -1, "address should have been validated");
      assert.ok(_lastException.Errors.indexOf("postcode is not present") > -1, "address should have been validated");
		next();
	})
	
	.then("no information will be saved", function(next) {
		
		next();
	});
	
})();
