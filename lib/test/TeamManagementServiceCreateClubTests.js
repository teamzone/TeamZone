/*jslint nomen: true */
'use strict';

var assert = require('assert'); // built-in node lib
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
require('../common/jsInject');
var teammanagementservice = require('../TeamManagementService');
var createError = require('errno').create;

describe("Team Management Service Unit Tests", function() {

  var levelimdb;
  var tms;
  var spyCallback;
  var sandbox;
  var $jsInject;
  var clubname = 'Western Knights';
  var fieldname = 'Nash Field';
  var suburbname = 'Mosman Park';
  var cityname = 'Perth';
  var adminemail = 'joe.king@gmail.com';
  var stubPut;
  var stubGet;
  var errorNotFound;
  
  function injectDependenciesForUserManagementService()  {
      //use in memory db, some calls are mocked anyway - but this makes it easier anyway
      levelimdb = levelcache();

      $jsInject = new $$jsInject();
      $jsInject.register("TeamManagementService", ["teams", teammanagementservice]);
      $jsInject.register("teams", [function() { return levelimdb; }]);

      //methods to tests are here with required dependencies passed through construction
      tms = $jsInject.get("TeamManagementService");
  }
  
  beforeEach(function()  {

      //Setup that is used across all tests
      injectDependenciesForUserManagementService();
      
      clubname = 'Western Knights';
      fieldname = 'Nash Field';
      suburbname = 'Mosman Park';
      cityname = 'Perth';
      adminemail = 'joe.king@gmail.com';
      
      //sandbox to cleanup global spies
      sandbox = sinon.sandbox.create();
      spyCallback = sandbox.spy();
      
      stubPut = sandbox.stub(levelimdb, 'put');
      stubPut.yields();
      stubGet = sandbox.stub(levelimdb, 'get');
      stubGet.yields(null, { });
      
      var NotFoundError = createError('NotFoundError');
      NotFoundError.prototype.notFound = true;
      errorNotFound = new NotFoundError();
  });

  afterEach(function()  {
    sandbox.restore();
  });

  it('Can create a valid club', function(done) {
    // 1. Setup
    stubGet.yields(errorNotFound);
    
    // 2. Exercise
    tms.CreateClub(clubname, fieldname, suburbname, cityname, adminemail, spyCallback);

    // 3. Verify
    assertClubWasCreated();
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Returns error clubname parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.CreateClub(null, fieldname, suburbname, cityname, adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('clubname');

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error fieldname parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.CreateClub(clubname, null, suburbname, cityname, adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('fieldname');

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error suburbname parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, '', cityname, adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('suburbname');

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error cityname parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, suburbname, '', adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('cityname');

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error adminemail parameter is missing', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, suburbname, cityname, null, spyCallback);
      
      // 3. Verify
      assertReturnsErrorForMissingParameter('adminemail');

      // 4. Cleanup/Teardown
      done();
  });
  
  it("Notification of invalid email error", function(done) {
      // 1. Setup - changing the default behaviour
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, suburbname, cityname, '--', spyCallback);
      
      // 3. Verify
      assertReturnsErrorForInvalidEmail();

      // 4. Cleanup/Teardown
      done();
  });
  
  it('Returns error if the same club is created within the same city, this prevents multiple club names appearing in the same city but allows it for other cities', function(done) {
      // 1. Setup
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, suburbname, cityname, adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorWhenClubInSameCityAlreadyExists();

      // 4. Cleanup/Teardown
      done();
  });
  
  it('Returns error if checking for existance of the team fails because of db failure', function(done) {
      // 1. Setup
      var message = "General Database Failure";
      stubGet.yields(new Error(message));
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, suburbname, cityname, adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorOnGeneralDatabaseFailure(message);

      // 4. Cleanup/Teardown
      done();
  });

  it('Returns error if the new team fails to be saved to the database', function(done) {
      // 1. Setup
      stubGet.yields(errorNotFound);      
      var errormessage = "Database access failed";
      stubPut.yields(new Error(errormessage));
      
      // 2. Exercise
      tms.CreateClub(clubname, fieldname, suburbname, cityname, adminemail, spyCallback);
      
      // 3. Verify
      assertReturnsErrorWhenNewUserDoesNotGetSavedToTheDatabase(errormessage);
      
      done();
  });
  
  function assertReturnsErrorForMissingParameter(parametername) {
    assert(callbackCalledWithError('The argument ' + parametername + ' is a required argument'), 'Missing parameter ' + parametername);  
  }
  
  function assertClubWasCreated() {
    assert(stubPut.calledWith(clubname + '~' + cityname, { field: fieldname, suburb: suburbname, admin: adminemail }), 'put not called with correct parameters');
    assert(callbackCalledWithNoError(), 'Callback not called after saving the team');
  }
  
  function assertReturnsErrorWhenClubInSameCityAlreadyExists() {
    assert(callbackCalledWithError('Club in the same city cannot be created more than once'), 'Error message not returned through callback');
  }
  
  function assertReturnsErrorOnGeneralDatabaseFailure(message) {
    assert(callbackCalledWithError(message), 'Error message not returned through callback');
  }
  
  function assertReturnsErrorWhenNewUserDoesNotGetSavedToTheDatabase(errormessage) {
    assert(callbackCalledWithError(errormessage), 'Failed to raise error message ' + errormessage);
  }
  
  function callbackCalledWithNoError() {
    return spyCallback.calledWith(sinon.match.falsy);
  }

  function assertReturnsErrorForInvalidEmail() {
    assert(callbackCalledWithError('The admin email is invalid'), 'Admin Email should have failed validation');  
  }

  function callbackCalledWithError(optionalMessage) {
    var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error));
    var messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
    return calledWithError && messageMatches;
  }
  
});