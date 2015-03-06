var assert = require('assert'); 
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
var dbhelpers = require('../DbHelpers');
var _ = require('underscore');

describe("Unit Tests for the DbHelpers code, the code that helps us in our testing", function() {

  var levelimdb;
  var spyCallback;
  var sandbox;
  var stubDel;
  var stubGet;
  var stubPut;
  var dbh;
  var clubname;
  var cityname;
  var fieldname;
  var suburbname;
  var adminemail;
  var squadname;
  var season;
  var agelimit;
  
  beforeEach(function()  {
      //sandbox to cleanup global spies
      sandbox = sinon.sandbox.create();
      spyCallback = sandbox.spy();
      
      levelimdb = levelcache();

      clubname = 'Fulham FC';
      cityname = 'London';
      fieldname = 'Craven Cottage';
      suburbname = 'Fulham';
      adminemail = 'mohammed@fulhamfc.co.uk';
      squadname = 'First team';
      season = '2015';
      agelimit = 'unrestricted';
      
      dbh = new dbhelpers();
      stubGet = sandbox.stub(levelimdb, 'get');
      stubPut = sandbox.stub(levelimdb, 'put');
      stubDel = sandbox.stub(levelimdb, 'del');
  });

  afterEach(function()  {
    sandbox.restore();
  });

  it('Can get a club from the datastore', function(done) {
    // 1. Setup
    stubGet.yields({ club: clubname, city: cityname, field: fieldname, suburb: suburbname, admin: adminemail });
    
    // 2. Exercise
    dbh.GetClub(levelimdb, clubname, cityname, spyCallback);

    // 3. Verify
    assertGotTheClub(clubname, cityname, fieldname, suburbname, adminemail);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can create a club in the datastore', function(done) {
    // 1. Setup
    var createdClubs = [];
    stubPut.yields();

    // 2. Exercise
    dbh.CreateClub(levelimdb, createdClubs, clubname, cityname, fieldname, suburbname, adminemail, spyCallback, true);

    // 3. Verify
    assertCreatedTheClub(clubname, cityname, fieldname, suburbname, adminemail, createdClubs, true);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can create a club in the datastore but not call the callback because we may want to use it as part of bigger workflow', function(done) {
    // 1. Setup
    var createdClubs = [];
    stubPut.yields();

    // 2. Exercise
    dbh.CreateClub(levelimdb, createdClubs, clubname, cityname, fieldname, suburbname, adminemail, spyCallback, false);

    // 3. Verify
    assertCreatedTheClub(clubname, cityname, fieldname, suburbname, adminemail, createdClubs, false);
    
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
  
  it('Can get a squad from the datastore', function(done) {
    // 1. Setup
    stubGet.yields({ club: clubname, city: cityname, squad: squadname, season: season, creator: adminemail, agelimit: agelimit });
    
    // 2. Exercise
    dbh.GetSquad(levelimdb, clubname, cityname, squadname, season, spyCallback);

    // 3. Verify
    assertGotTheSquad(clubname, cityname, squadname, season, adminemail);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('Can remove a squad from the datastore', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveSquad(levelimdb, clubname, cityname, squadname, season, spyCallback);

    // 3. Verify
    assertRemovedTheSquad(clubname, cityname, squadname, season);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('Reports error on failure to remove a squad from the datastore', function(done) {
    // 1. Setup
    var expectedError = new Error('Db Failure');
    stubDel.yields(expectedError);
    
    // 2. Exercise
    dbh.RemoveSquad(levelimdb, clubname, cityname, squadname, season, spyCallback);

    // 3. Verify
    assertRemoveSquadReportsErrorViaCallback(expectedError);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('RemoveSquad should call the callback on success when explicitly instructed to do so', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveSquad(levelimdb, clubname, cityname, squadname, season, spyCallback, true);

    // 3. Verify
    assertRemovedTheSquad(clubname, cityname, squadname, season);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('RemoveSquad should not call the callback on success when instructed not to', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveSquad(levelimdb, clubname, cityname, squadname, season, spyCallback, false);

    // 3. Verify
    assertRemovedTheSquadWithoutACallback(clubname, cityname, squadname, season);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  function assertCreatedTheClub(clubname, cityname, fieldname, suburbname, adminemail, createdClubs, checkCallBack) {
    assert(stubPut.calledWith(clubname + '~' + cityname, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }), 'put not called with correct parameters');
    if (checkCallBack) 
      assert(callbackCalledWithNoError(), 'Callback not called after saving the club');
    else
      assert(spyCallback.callCount === 0, 'Callback should not called after saving the club');
    assert(_.find(createdClubs, function(c) { return c.club === clubname && c.city === cityname && c.field === fieldname && c.suburb === suburbname && c.admin === adminemail; }), 'Club not found in array');
  }
  
  function assertGotTheClub(clubname, cityname, fieldname, suburbname, adminemail) {
    assert(stubGet.calledWith(clubname + '~' + cityname), 'get not called with correct parameters');
    assert(spyCallback.calledWith({ club: clubname, city: cityname, field: fieldname, suburb: suburbname, admin: adminemail }), 'Did not receive the callback');
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
  
  function assertGotTheSquad() {
    assert(stubGet.calledWith(clubname + '~' + cityname + '~' + squadname + '~' + season), 'get not called with correct parameters');
    assert(spyCallback.calledWith({ club: clubname, city: cityname, squad: squadname, season: season, agelimit: agelimit, creator: adminemail }), 'Did not receive the callback');
  }
  
  function assertRemovedTheSquad(clubname, cityname, squadname, season) {
    assert(stubDel.calledWith(squadKey(clubname, cityname, squadname, season), { sync: true }), 'delete not called with correct parameters');
    assert(spyCallback.called, 'Did not receive the callback');
  }
  
  function assertRemovedTheSquadWithoutACallback(clubname, cityname, squadname, season) {
    assert(stubDel.calledWith(squadKey(clubname, cityname, squadname, season), { sync: true }), 'delete not called with correct parameters');
    assert(!spyCallback.called, 'Should not receive the callback');
  }
  
  function assertRemoveSquadReportsErrorViaCallback(expectedError) {
    assert(spyCallback.calledWith(expectedError), 'Callback needs to be called with the expectedError: ' + expectedError.message);
  }
  
  function callbackCalledWithNoError() {
    return spyCallback.calledWith(sinon.match.falsy);
  }

  function squadKey(clubname, cityname, squadname, season) {
    return clubname + '~' + cityname + '~' + squadname + '~' + season; 
  }
  
});