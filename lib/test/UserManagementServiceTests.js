var assert = require('assert'); // built-in node lib
var async = require('async')
var levelcache = require('level-cache');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
require('mocha-sinon');
var usermanagementservice = require('../UserManagementService'); // The library that you wish to test 

describe("User Management Service Unit Tests", function() {

  var imdb;
  var levelimdb;
  var stubCompareCrypt;
  var ums;
  var spyCallback;
  var stubGet;
  var sandbox;
  var user;
  var password;
  var surname;
  var firstname;
  
  beforeEach(function()  {

      //Setup that is used across all tests
      
      //use in memory db, some calls are mocked anyway - but this makes it easier anyway
      imdb = levelcache();
      levelimdb = levelcache();
      
      //sandbox to cleanup global spies
      sandbox = sinon.sandbox.create();
      stubCompareCrypt = sandbox.stub(bcrypt, 'compare');
      spyCallback = sandbox.spy();
      stubGet = sandbox.stub(levelimdb, 'get');

      //methods to tests are here with required dependencies passed through construction
      ums = new usermanagementservice(imdb, levelimdb, bcrypt);

  })

  afterEach(function()  {
    sandbox.restore();
  })
  
  it("Should validate login credentials", function(done) {

      TestSetup();
      
      //2. Exercise
      ums.LoginUser(user, password, spyCallback);
      
      //3. Verify
      assert(spyCallback.calledOnce, 'Callback not called');
      assert(spyCallback.calledWith(undefined), 'Not expecting an error');      
      
      //4. Teardown
      //Nothing to tear down
      done();
  });

  it("Should return a result on valid login", function(done) {

      TestSetup();
      
      //2. Exercise
      ums.LoginUser(user, password, spyCallback);
      
      //3. Verify
      var result = spyCallback.args[0][1];
      assert.equal(firstname, result.firstname, "firstname does not match");
      assert.equal(surname, result.surname, "surname does not match");                                                                                           			   					   
      assert.equal(user, result.email, "email does not match ");					   
      assert(result.loggedIn, "Should be Logged In"); 
      assert(result.password === undefined, 'Should not have a password returned');
    
      //4. Teardown
      //Nothing to tear down
      done();
  });

  it("Should compare the password hash", function(done) {

      TestSetup();
      
      //2. Exercise
      ums.LoginUser(user, password, spyCallback);
      
      //3. Verify
      assert(stubCompareCrypt.calledOnce, 'Hash was not compared');

      //4. Teardown
      //Nothing to tear down
      done();
  });
  
  it("When the password hash compare fails the caller should be notified", function(done) {

      var expectedHashError = new Error('Hash Failure');
      TestSetup(expectedHashError);

      //2. Exercise
      ums.LoginUser(user, password, spyCallback);
      
      //3. Verify
      assert(spyCallback.calledWith(expectedHashError), 'Expecting error in callback');

      //4. Teardown
      //Nothing to tear down
      done();
  });
  
  it("Given the user is not registered, should return an error", function(done) {
    
    // Setup
      var user = 'massimo@mu.co.uk';
      var password = '@1_yuupp$$31';
      var expectedError = new Error('Notfound');
      stubGet.yields(expectedError, null);

    // Exercise
      ums.LoginUser(user, password, spyCallback);

    // Verify
      assert(spyCallback.calledWith(expectedError), 'Expecting error in callback');
    
    // Teardown
    // Nothing to teardown
    done();
  });
  
  function TestSetup(hashError, passwordMatches)  {
      user = 'john@mu.co.uk';
      password = 'FergusonTheGreatest';
      firstname = 'John';
      surname = 'Ferguson';
      var expectedValue = { password: 'hashedPassword', firstname: firstname, surname: surname, email: user, loggedIn: true};
      stubGet.yields(null, expectedValue);
      stubCompareCrypt.callsArgWith(2, hashError, passwordMatches);
  };
  
});