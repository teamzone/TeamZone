var assert = require('assert'); 
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
var dbhelpers = require('../DbHelpers');

describe("Unit Tests for the DbHelpers code, the code that helps us in our testing", function() {

  var levelimdb;
  var spyCallback;
  var sandbox;
  var stubDel;
  var stubGet;
  var dbh;
  var clubname;
  var cityname;
  
  beforeEach(function()  {
      //sandbox to cleanup global spies
      sandbox = sinon.sandbox.create();
      spyCallback = sandbox.spy();
      
      levelimdb = levelcache();

      clubname = 'Fulham FC';
      cityname = 'London';
      
      dbh = new dbhelpers();
      stubGet = sandbox.stub(levelimdb, 'get');
      
      stubDel = sandbox.stub(levelimdb, 'del');
  });

  afterEach(function()  {
    sandbox.restore();
  });

  it('Can get a club from the teams datastore', function(done) {
    // 1. Setup
    var fieldname = 'Craven Cottage';
    var suburbname = 'Fulham';
    var adminemail = 'mohammed@fulhamfc.co.uk';
    stubGet.yields({ field: fieldname, suburb: suburbname, admin: adminemail });
    
    // 2. Exercise
    dbh.GetClub(levelimdb, clubname, cityname, spyCallback);

    // 3. Verify
    assertGotTheClub(clubname, cityname, fieldname, suburbname, adminemail);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Reports error on failure to get a club from the teams datastore', function(done) {
    // 1. Setup
    var expectedError = new Error('Db Failure');
    stubGet.yields(expectedError);
    
    // 2. Exercise
    dbh.GetClub(levelimdb, clubname, cityname, spyCallback);

    // 3. Verify
    assertGetClubReportsErrorViaCallback(expectedError);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can remove a club from the teams datastore', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveClub(levelimdb, clubname, cityname, spyCallback);

    // 3. Verify
    assertRemovedTheClub(clubname, cityname);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('Reports error on failure to remove a club from the teams datastore', function(done) {
    // 1. Setup
    var expectedError = new Error('Db Failure');
    stubDel.yields(expectedError);
    
    // 2. Exercise
    dbh.RemoveClub(levelimdb, clubname, cityname, spyCallback);

    // 3. Verify
    assertRemoveClubReportsErrorViaCallback(expectedError);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('RemoveClub should call the callback on success when explicitly instructed to do so', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveClub(levelimdb, clubname, cityname, spyCallback, true);

    // 3. Verify
    assertRemovedTheClub(clubname, cityname);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('RemoveClub should not call the callback on success when instructed not to', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveClub(levelimdb, clubname, cityname, spyCallback, false);

    // 3. Verify
    assertRemovedTheClubWithoutACallback(clubname, cityname);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  function assertGotTheClub(clubname, cityname, fieldname, suburbname, adminemail) {
    assert(stubGet.calledWith(clubname + '~' + cityname), 'get not called with correct parameters');
    assert(spyCallback.calledWith({ field: fieldname, suburb: suburbname, admin: adminemail }), 'Did not receive the callback');
  }

  function assertGetClubReportsErrorViaCallback(expectedError) {
      assert(spyCallback.calledWith(expectedError), 'Callback needs to be called with the expectedError: ' + expectedError.message);
  }
  
  function assertRemoveClubReportsErrorViaCallback(expectedError) {
      assert(spyCallback.calledWith(expectedError), 'Callback needs to be called with the expectedError: ' + expectedError.message);
  }
  
  function assertRemovedTheClub(clubname, cityname) {
    assert(stubDel.calledWith(clubname + '~' + cityname, { sync: true }), 'delete not called with correct parameters');
    assert(spyCallback.called, 'Did not receive the callback');
  }

  function assertRemovedTheClubWithoutACallback(clubname, cityname) {
    assert(stubDel.calledWith(clubname + '~' + cityname, { sync: true }), 'delete not called with correct parameters');
    assert(!spyCallback.called, 'Should not receive the callback');
  }

});