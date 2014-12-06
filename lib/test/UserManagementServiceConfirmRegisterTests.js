var assert = require('assert'); // built-in node lib
var levelcache = require('level-cache');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var emailverifyservice = require('../EmailVerifyService');
var createError = require('errno').create;
require('mocha-sinon');
require('../common/jsInject');
var token = require('token');
var usermanagementservice = require('../UserManagementService');

describe("User Management Service Confirm Registered User Unit Tests", function() {

  var levelimdb;
  var ums;
  var spyCallback;
  var stubGet;
  var stubPut;
  var sandbox;
  var errorNotFound;
  var stubTokenVerify;
  var expectedUserObject;
  var $jsInject;
  
  function injectDependenciesForUserManagementService()  {
      //use in memory db, some calls are mocked anyway - but this makes it easier anyway
      levelimdb = levelcache();
      var evs = new emailverifyservice();

     // ums = new usermanagementservice(levelimdb, bcrypt, token, evs);
      
      $jsInject = new $$jsInject();
      $jsInject.register("UserManagementService", ["users", "crypt", "tokenizer", "emailsender", usermanagementservice]);
      $jsInject.register("users", [function() { return levelimdb; }]);
      $jsInject.register("crypt", [function() { return bcrypt; }]);
      $jsInject.register("tokenizer", [function() { return token; }]);
      $jsInject.register("emailsender", [function() { return evs; }]);
      
      //methods to tests are here with required dependencies passed through construction

      ums = $jsInject.get("UserManagementService");
  }
  
  beforeEach(function()  {

      //Setup that is used across all tests
      injectDependenciesForUserManagementService();
      
      //sandbox to cleanup global spies - test runner doesn't create new instance variables!
      sandbox = sinon.sandbox.create();
      spyCallback = sandbox.spy();
      stubGet = sandbox.stub(levelimdb, 'get');
      stubPut = sandbox.stub(levelimdb, 'put');
      stubTokenVerify = sandbox.stub(token, 'verify');

      // default mocked values for the tests.
      expectedUserObject = { password: 'hashedPassword', firstname: 'John', surname: 'Ferguson', email: 'john@mu.co.uk', confirmed: true, loggedIn: true, token: 'A token generated when the user registered - it will have a expiration as well'};
      stubGet.yields(null, expectedUserObject);
      stubPut.yields();
      stubTokenVerify.returns(true);

      var NotFoundError = createError('NotFoundError');
      NotFoundError.prototype.notFound = true;
      errorNotFound = new NotFoundError();
  });

  afterEach(function()  {
    sandbox.restore();
  })
  
  it('Allows confirmation of a new user', function(done) {

    // 2. Exercise
    ums.ConfirmRegisterUser(expectedUserObject.email, expectedUserObject.token, spyCallback);
      
    //3. Verify
    assertRegisteredUserIsConfirmed(expectedUserObject.email, expectedUserObject.password, expectedUserObject.email, expectedUserObject.token);
    done();
  });

  it('Returns error when user not longer exists prior to confirming', function(done) {

    // 1. Setup
    stubGet.yields(errorNotFound);    
    
    // 2. Exercise
    ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);
      
    //3. Verify
    assertReturnsErrorOnGetForRegisteredUser(expectedUserObject.email, 'The user ' + expectedUserObject.email + ' is not present in the database');
    done();
  });

  it('Returns error on a general get failure prior to confirming', function(done) {

    // 1. Setup
    var message = "General Database Failure";
    stubGet.yields(new Error(message));  
    
    // 2. Exercise
    ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);
      
    //3. Verify
    assertReturnsErrorOnGetForRegisteredUser(expectedUserObject.email, 'A failure occurred trying to retrieve details for ' + expectedUserObject.email);
    done();
  });

  it('Returns error on when saving the confirmed user fails', function(done) {

    // 1. Setup
    var errormessage = "Database access failed";
    stubPut.yields(new Error(errormessage));
    
    // 2. Exercise
    ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);
      
    //3. Verify
    assertReturnsErrorOnSaveForRegisteredUser(expectedUserObject.email, 'A failure occurred trying to save confirmation for ' + expectedUserObject.email);
    done();
  });

  function assertReturnsErrorOnSaveForRegisteredUser(user, message) {
    assert(callbackCalledWithError(message), 'Error message not returned through callback.  Expected message is ' + message);
  }
  
  function assertReturnsErrorOnGetForRegisteredUser(user, message) {
    assert(callbackCalledWithError(message), 'Error message not returned through callback.  Expected message is ' + message);
  }
  
  function assertRegisteredUserIsConfirmed(user, password, email, tokenValue) {
    assert(stubTokenVerify.calledWith(user, tokenValue), 'Token verifier was not enacted for user ' + user + ' and token ' + tokenValue);
    assert(stubPut.calledWith(user, sinon.match({ password: password, email: email, token: tokenValue, confirmed: true })), 'put not called with user data with confirmation flagg');
    sinon.assert.callOrder(stubTokenVerify, stubPut);
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