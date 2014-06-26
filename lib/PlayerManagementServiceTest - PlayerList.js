var assert = require('assert'); // built-in node lib
var Pms = require('./PlayerManagementService'); // The library that you wish to test
var sinon = require('sinon');

/// <reference path="PlayerManagementService.js" />

describe("Player Management Service Player List Tests", function() {
  
  var pms = new Pms();
  var testTeam = 'Western Knight 1st Team';
  var testPlayerFirstName1 = 'Davor';
  var testPlayerSurname1 = 'Suker';
  var testPlayerFirstName2 = 'Nikica';
  var testPlayerSurname2 = 'Jelavic';
  
  before(function(done) {

    pms.AddPlayer(testTeam, testPlayerFirstName1, testPlayerSurname1, '1/1/2001', '1 Tester Way', 'Moolabah', '4059', '09722721', 'davor@wk.com', 
                function(res, err) { 
                    if (err) 
                        done(err); 
                });
    pms.AddPlayer(testTeam, testPlayerFirstName2, testPlayerSurname2, '1/2/2001', '1 Testing Way', 'Moolabah', '4059', '09722734', 'nikica@wk.com',  
                function(res, err) { 
                    if (err) 
                        done(err); 
                    else
                        done(); 
                });

  });

  after(function(done) {
    console.log('Processing after');
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

  it("Ask for all players in the team should return 2 players", function(done) {

      pms.GetPlayers(testTeam, 
            function(res, err) {
                if (err) 
                {
                    console.log('Ooops! error in GetPlayers', err) // some kind of I/O error
                    done(err);
                }
                else
                {
                    console.log('Players returned = %s', res.length);
                    assert(res.length === 2, 'Expected two players for team ' + testTeam);
                    done();
                }
      });
  });
     
  it("Ask for all players in a  non-existant team should return 0 players", function(done) {

      pms.GetPlayers('The Team the does not exist', 
            function(res, err) {
                if (err) 
                {
                    console.log('Ooops! error in GetPlayers', err) // some kind of I/O error
                    done(err);
                }
                else
                {
                    console.log('Players returned = %s', res.length);
                    assert(res.length === 0, 'Expected no players for team');
                    done();
                }
      });
  });   
});