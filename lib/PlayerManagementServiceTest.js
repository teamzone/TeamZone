var assert = require('assert'); // built-in node lib
var Pms = require('./PlayerManagementService'); // The library that you wish to test
var sinon = require('sinon');

/// <reference path="PlayerManagementService.js" />

describe("Player Management Service Unit Tests", function() {
  
  var pms = new Pms();
  var testTeam = 'Western Knight 1st Team';
  var testPlayerFirstName1 = 'Niko';
  var testPlayerSurname1 = 'Kranjcar';
  var testPlayerFirstName2 = 'Ivica';
  var testPlayerSurname2 = 'Olic';
  
  beforeEach(function(done) {
    //clear down our test data
    pms.Delete(testTeam, testPlayerFirstName1, testPlayerSurname1, 
                function(res, err) { 
                    if (err) 
                        done(err); 
                });
    pms.Delete(testTeam, testPlayerFirstName2, testPlayerSurname2,  
                function(res, err) { 
                    if (err) 
                        done(err); 
                    else
                        done(); 
                });
  });

  it("Should save a valid object to the data store", function(done) {

      var dob = '1/1/2001';
      var address = '1 Testing Way';
      var suburb = 'Moolabah';
      var postcode = '4059';
      var phone = '09722722';
      var email = 'niko@wk.com';

      pms.AddPlayer(testTeam, testPlayerFirstName1, testPlayerSurname1, dob, address, suburb, postcode, phone, email, 
            function(res, errAdd) {
                if (errAdd) 
                {
                    console.log('Ooops! error in AddPlayer', err) // some kind of I/O error
                    done(errAdd);
                }
                console.log('Try and get the Player back');

                pms.GetPlayer(testTeam, testPlayerFirstName1, testPlayerSurname1, function (value, errGet) {
						if (errGet) 
						{
							console.log('Ooops!', err) // some kind of I/O error
							done(errGet);
						}
					   					   
					   assert(value !== null, "No value returned");
					   
					   //the result is returned as a JSON string
					   var playerObject = JSON.parse( value );
					   					   
					   assert(dob == playerObject.dob);
					   assert(address == playerObject.address, "address does not match");
					   assert(suburb == playerObject.suburb);
					   assert.equal(postcode, playerObject.postcode, "postcode does not match ");
					   assert.equal(phone, playerObject.phone, "postcode does not match ");
                       assert.equal(email, playerObject.email, "postcode does not match ");                                                                                                                               
                                                                                                                               					   
					   done();
				    });
      });
  });
     
  it("Should report an invalid object", function(done) {

      var dob = '1/1/2001';
      var address = '1 Testing Way';
      var suburb = 'Moolabah';
      var postcode = '4059';
      var phone = '09722722';
      var email = 'niko@wk.com';

      pms.AddPlayer(testTeam, null, testPlayerSurname1, dob, address, suburb, postcode, phone, email, 
            function(res, errAdd) {
                if (errAdd) 
                {
                    console.log('Ooops! error in AddPlayer', errAdd) // some kind of I/O error
                    assert.ok('This is correct - error was raised');
                    done();
                }
                else
                {
                    assert.fail('Expected to have an error and not reach here');
                    done();
                }
            });
  });
 
});