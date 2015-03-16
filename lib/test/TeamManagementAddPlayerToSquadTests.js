/*jslint nomen: true */
'use strict';

var assert = require('assert'); // built-in node lib
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
require('../common/jsInject');
var teammanagementservice = require('../TeamManagementService');
var createError = require('errno').create;
var NotFoundError = createError('NotFoundError');
NotFoundError.prototype.notFound = true;

describe("Team Management Service - Add Player to Squad Unit Tests", function() {

  var clubsdb;
  var playersdb;
  var squadsdb;
  var squadplayersdb;
  var tms;
  var spyCallback;
  var sandbox;
  var $jsInject;
  var playeremail;
  var squadname;
  var season;
  var stubPut;
  var stubGet;
  var stubPlayerGet;
  var stubSquadGet;
  var errorNotFound;

  function injectDependenciesForService()  {
      //use in memory db, some calls are mocked anyway - but this makes it easier anyway
      clubsdb = levelcache();
      squadsdb = levelcache();
      playersdb = levelcache();
      squadplayersdb = levelcache();
      
      $jsInject = new $$jsInject();
      $jsInject.register("TeamManagementService", ["clubs", "squads", "players", "squadplayers", teammanagementservice]);
      $jsInject.register("clubs", [function() { return clubsdb; }]);
      $jsInject.register("squads", [function() { return squadsdb; }]);
      $jsInject.register("players", [function() { return playersdb; }]);
      $jsInject.register("squadplayers", [function() { return squadplayersdb; }]);

      //methods to tests are here with required dependencies passed through construction
      tms = $jsInject.get("TeamManagementService");
  }
  
  beforeEach(function()  {
      //Setup that is used across all tests
      injectDependenciesForService();
      
      clubname = 'Western Knights';
      cityname = 'Perth';
      playeremail = 'kdaglish@gmail.com';
      squadname = '1st Team';
      season = '2015';
      agelimit = 'over 16';
      
      //sandbox to cleanup global spies
      sandbox = sinon.sandbox.create();
      spyCallback = sandbox.spy();
      
      stubPut = sandbox.stub(squadplayersdb, 'put');
      stubPut.yields();
      stubGet = sandbox.stub(squadplayersdb, 'get');
      stubGet.yields(null, { });
      stubPlayerGet = sandbox.stub(playersdb, 'get');
      stubPlayerGet.yields(null, { dob: '21 Dec 1988'});
      stubSquadGet = sandbox.stub(squadsdb, 'get');
      stubSquadGet.yields(null, { agelimit: 'over 16' });
      
      errorNotFound = new NotFoundError();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('Can add a player to a squad', function(done) {
    // 1. Setup
    stubGet.yields(errorNotFound);
    
    // 2. Exercise
    tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);

    // 3. Verify
    assertPlayerAddedToSquad();
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Will not add a player to a squad when the player is too young', function(done) {
    // 1. Setup
    stubGet.yields(errorNotFound);
    stubPlayerGet.yields(null, { dob: '20 Dec 2005' });
    
    // 2. Exercise
    tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);

    // 3. Verify
    assertReturnedAgeLimitExceedError();
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Will not add a player to a squad when the player is too old', function(done) {
    // 1. Setup
    stubGet.yields(errorNotFound);
    stubPlayerGet.yields(null, { dob: '20 Dec 1991' });
    squadname = 'Under 14s';
    stubSquadGet.yields(null, { agelimit: 'under 14' });
    
    // 2. Exercise
    tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);

    // 3. Verify
    assertReturnedAgeLimitExceedPlayerTooOldError();
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Will report error when asking for player details during eligibility checking', function(done) {
    // 1. Setup
    stubGet.yields(errorNotFound);
    stubPlayerGet.yields(new Error('Database Access Error'));
    
    // 2. Exercise
    tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);

    // 3. Verify
    assertPlayerGetErrorIsReported();
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Will report error when asking for squad details during eligibility checking', function(done) {
    // 1. Setup
    stubGet.yields(errorNotFound);
    stubSquadGet.yields(new Error('Database Access Error'));
    
    // 2. Exercise
    tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);

    // 3. Verify
    assertPlayerGetErrorIsReported();
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Returns error squadname parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.AddPlayerToSquad(null, season, playeremail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('squadname');

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error season parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.AddPlayerToSquad(squadname, '', playeremail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('season');

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error player email parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.AddPlayerToSquad(squadname, season, undefined, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('playeremail');

      // 4. Cleanup/Teardown
      done();
  });

  it("Notification of invalid player email error", function(done) {
      // 1. Setup - changing the default behaviour
      
      // 2. Exercise
      tms.AddPlayerToSquad(squadname, season, '---', spyCallback);
      
      // 3. Verify
      assertReturnsErrorForInvalidPlayerEmail();

      // 4. Cleanup/Teardown
      done();
  });

  
  it('Returns error if the same player is created within the same squad and season', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorWhenPlayerAlreadyExistsInSquad();

      // 4. Cleanup/Teardown
      done();
  });
  
  it('Returns error if checking for existance of the player in the squad fails because of db failure', function(done) {
      // 1. Setup
      var message = "General Database Failure";
      stubGet.yields(new Error(message));
      
      // 2. Exercise
      tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorOnGeneralDatabaseFailure(message);

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error if when adding the new player to the squad fails to be saved to the database', function(done) {
      // 1. Setup
      stubGet.yields(errorNotFound);      
      var errormessage = "Database access failed";
      stubPut.yields(new Error(errormessage));
      
      // 2. Exercise
      tms.AddPlayerToSquad(squadname, season, playeremail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorWhenNewSquadPlayerDoesNotGetSavedToTheDatabase(errormessage);
      
      done();
  });
  
  function assertPlayerGetErrorIsReported() {
    assert(callbackCalledWithError('Database Access Error'), 'Expected player get to report error');
  }
  
  function assertReturnedAgeLimitExceedError() {
    assert(callbackCalledWithError('Player does not qualify for the squad due to being underaged'), 'Expected player to fail validation - too young');  
  }
  
  function assertReturnedAgeLimitExceedPlayerTooOldError() {
    assert(callbackCalledWithError('Player does not qualify for the squad due to being over age'), 'Expected player to fail validation - too old');
  }
  
  function assertReturnsErrorForMissingParameter(parametername) {
    assert(callbackCalledWithError('The argument ' + parametername + ' is a required argument'), 'Missing parameter ' + parametername);  
  }
  
  function assertReturnsErrorForInvalidPlayerEmail() {
    assert(callbackCalledWithError('The player email is invalid'), 'Admin Email should have failed validation');  
  }
  
  function assertPlayerAddedToSquad() {
    assert(stubPut.calledWith(squadname + '~' + season + '~' + playeremail, { playeremail: playeremail }, { sync: true }), 'put not called with correct parameters');
    assert(callbackCalledWithNoError(), 'Callback not called after saving the team');
  }
  
  function assertReturnsErrorWhenPlayerAlreadyExistsInSquad() {
    assert(callbackCalledWithError('Cannot add the same player twice to a squad'), 'Error message not returned through callback');
  }
  
  function assertReturnsErrorOnGeneralDatabaseFailure(message) {
    assert(callbackCalledWithError(message), 'Error message not returned through callback');
  }
  
  function assertReturnsErrorWhenNewSquadPlayerDoesNotGetSavedToTheDatabase(errormessage) {
    assert(callbackCalledWithError(errormessage), 'Failed to raise error message ' + errormessage);
  }
  
  function callbackCalledWithNoError() {
    return spyCallback.calledWith(sinon.match.falsy);
  }

  function callbackCalledWithError(optionalMessage) {
    var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error));
    var messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
    return calledWithError && messageMatches;
  }
  
});