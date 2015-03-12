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
  var playerFirstname, playerSurname, playerEmail, playerDOB, playerAddress, playerSuburb, playerPostCode, playerPhone;
  
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
      playerFirstname = 'Luke';
      playerSurname = 'Teal';
      playerEmail = 'luke.teal@wk.com.au';
      playerDOB = '20 Dec 1988';
      playerAddress = '10 Birchlow Street';
      playerSuburb = 'BalWest';
      playerPostCode = '6061';
      playerPhone = '0421 846 808';
      
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

  it('Can create a squad in the datastore', function(done) {
    // 1. Setup
    var createdSquads = [];
    stubPut.yields();

    // 2. Exercise
    dbh.CreateSquad(levelimdb, createdSquads, clubname, cityname, squadname, season, agelimit, adminemail, spyCallback, true);

    // 3. Verify
    assertCreatedTheSquad(clubname, cityname, squadname, season, agelimit, adminemail, createdSquads, true);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can create a club in the datastore but not call the callback because we may want to use it as part of bigger workflow', function(done) {
    // 1. Setup
    var createdSquads = [];
    stubPut.yields();

    // 2. Exercise
    dbh.CreateSquad(levelimdb, createdSquads, clubname, cityname, squadname, season, agelimit, adminemail, spyCallback, false);

    // 3. Verify
    assertCreatedTheSquad(clubname, cityname, squadname, season, agelimit, adminemail, createdSquads, false);
    
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

  it('Can remove a squad player from the datastore', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveSquadPlayer(levelimdb, squadname, season, playerEmail, spyCallback);

    // 3. Verify
    assertRemovedTheSquadPlayer(squadname, season, playerEmail);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('Reports error on failure to remove a squad player from the datastore', function(done) {
    // 1. Setup
    var expectedError = new Error('Db Failure');
    stubDel.yields(expectedError);
    
    // 2. Exercise
    dbh.RemoveSquadPlayer(levelimdb, squadname, season, playerEmail, spyCallback);

    // 3. Verify
    assertRemoveSquadPlayerReportsErrorViaCallback(expectedError);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('RemoveSquadPlayer should call the callback on success when explicitly instructed to do so', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveSquadPlayer(levelimdb, squadname, season, playerEmail, spyCallback, true);

    // 3. Verify
    assertRemovedTheSquadPlayer(squadname, season, playerEmail);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('RemoveSquadPlayer should not call the callback on success when instructed not to', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemoveSquadPlayer(levelimdb, squadname, season, playerEmail, undefined, false);

    // 3. Verify
    assertRemovedTheSquadPlayerWithoutACallback(squadname, season, playerEmail);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can create a player in the datastore', function(done) {
    // 1. Setup
    var createdPlayers= [];
    stubPut.yields();

    // 2. Exercise
    dbh.CreatePlayer(levelimdb, createdPlayers, playerEmail, playerFirstname, playerSurname, 
                     playerDOB, playerAddress, playerSuburb, playerPostCode, playerPhone, spyCallback, true);

    // 3. Verify
    assertCreatedThePlayer(playerEmail, playerFirstname, playerSurname, 
                     playerDOB, playerAddress, playerSuburb, playerPostCode, playerPhone, createdPlayers, true);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can create a player in the datastore but not call the callback because we may want to use it as part of bigger workflow', function(done) {
    // 1. Setup
    var createdPlayers= [];
    stubPut.yields();

    // 2. Exercise
    dbh.CreatePlayer(levelimdb, createdPlayers, playerEmail, playerFirstname, playerSurname, 
                     playerDOB, playerAddress, playerSuburb, playerPostCode, playerPhone, spyCallback, false);

    // 3. Verify
    assertCreatedThePlayer(playerEmail, playerFirstname, playerSurname, 
                     playerDOB, playerAddress, playerSuburb, playerPostCode, playerPhone, createdPlayers, false);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can remove a player from the datastore', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemovePlayer(levelimdb, playerEmail, spyCallback);

    // 3. Verify
    assertRemovedThePlayer(playerEmail);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('Reports error on failure to remove a player from the datastore', function(done) {
    // 1. Setup
    var expectedError = new Error('Db Failure');
    stubDel.yields(expectedError);
    
    // 2. Exercise
    dbh.RemovePlayer(levelimdb, playerEmail, spyCallback);

    // 3. Verify
    assertRemovePlayerReportsErrorViaCallback(expectedError);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('RemovePlayer should call the callback on success when explicitly instructed to do so', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemovePlayer(levelimdb, playerEmail, spyCallback, true);

    // 3. Verify
    assertRemovedThePlayer(playerEmail);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  it('RemovePlayer should not call the callback on success when instructed not to', function(done) {
    // 1. Setup
    stubDel.yields(null);
    
    // 2. Exercise
    dbh.RemovePlayer(levelimdb, playerEmail, spyCallback, false);

    // 3. Verify
    assertRemovedThePlayerWithoutACallback(playerEmail);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete players, squads, clubs, users', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdClubs: [],
      createdUsers: [],
      createdSquadPlayers: [],
      stubDelPlayersDb: undefined, 
      stubDelSquadsDb: undefined, 
      stubDelClubsDb: undefined, 
      stubDelUsersDb: undefined
    };
    
    var dbs = setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload);
    cascadeDeleteTestPayload.createdSquadPlayers = undefined;
    
    // 2. Exercise
    dbh.CascadeDelete(dbs, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, cascadeDeleteTestPayload.createdSquadPlayers,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete players, squads, squadplayers, clubs, users', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdClubs: [],
      createdUsers: [],
      createdSquadPlayers: [],
      stubDelPlayersDb: undefined, 
      stubDelSquadsDb: undefined, 
      stubDelSquadPlayersDb: undefined,
      stubDelClubsDb: undefined, 
      stubDelUsersDb: undefined
    };
    
    var dbs = setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload);

    // 2. Exercise
    dbh.CascadeDelete(dbs, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, cascadeDeleteTestPayload.createdSquadPlayers,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete players, squads, squadplayers, users', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdSquadPlayers: [],
      createdClubs: [],
      createdUsers: [],
      stubDelPlayersDb: undefined, 
      stubDelSquadsDb: undefined, 
      stubDelClubsDb: undefined, 
      stubDelUsersDb: undefined
    };
    
    var dbs = setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload);
    cascadeDeleteTestPayload.createdClubs = undefined;
    
    // 2. Exercise
    dbh.CascadeDelete(dbs, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, cascadeDeleteTestPayload.createdSquadPlayers,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete squads, clubs, users', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdSquadPlayers: [],
      createdClubs: [],
      createdUsers: [],
      stubDelPlayersDb: undefined, 
      stubDelSquadsDb: undefined, 
      stubDelClubsDb: undefined, 
      stubDelUsersDb: undefined
    };
    
    var dbs = setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload);
    cascadeDeleteTestPayload.createdPlayers = undefined;
    cascadeDeleteTestPayload.createdSquadPlayers = undefined;
    
    // 2. Exercise
    dbh.CascadeDelete(dbs, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, cascadeDeleteTestPayload.createdSquadPlayers,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete players, clubs, users', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdSquadPlayers: [],
      createdClubs: [],
      createdUsers: [],
      stubDelPlayersDb: undefined, 
      stubDelSquadsDb: undefined, 
      stubDelClubsDb: undefined, 
      stubDelUsersDb: undefined
    };
    
    var dbs = setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload);
    cascadeDeleteTestPayload.createdSquads = undefined;
    cascadeDeleteTestPayload.createdSquadPlayers = undefined;
    
    // 2. Exercise
    dbh.CascadeDelete(dbs, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, cascadeDeleteTestPayload.createdSquadPlayers,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete players, squads, squadplayers, clubs', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdSquadPlayers: [],
      createdClubs: [],
      createdUsers: [],
      stubDelPlayersDb: undefined, 
      stubDelSquadsDb: undefined, 
      stubDelClubsDb: undefined, 
      stubDelUsersDb: undefined
    };
    
    var dbs = setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload);
    cascadeDeleteTestPayload.createdUsers = undefined;
    
    // 2. Exercise
    dbh.CascadeDelete(dbs, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, cascadeDeleteTestPayload.createdSquadPlayers,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });

  it('Can cascade delete complete when nothing to delete', function(done) {
    // 1. Setup
    var cascadeDeleteTestPayload = {
      createdPlayers: [],
      createdSquads: [],
      createdClubs: [],
      createdUsers: []
    };
    
    // 2. Exercise
    dbh.CascadeDelete(undefined, cascadeDeleteTestPayload.createdPlayers, cascadeDeleteTestPayload.createdSquads, undefined,
                      cascadeDeleteTestPayload.createdClubs, cascadeDeleteTestPayload.createdUsers, spyCallback);

    // 3. Verify
    assertCascadeDeleteCompletesWhenNothingToDelete(cascadeDeleteTestPayload);
    
    // 4. Cleanup/Teardown
    done();
  });
  
  function setupForCascadeDeletePlayersSquadsClubsUsers(cascadeDeleteTestPayload) {

    var playersDb = levelcache();
    var squadsDb = levelcache();
    var squadPlayersDb = levelcache();
    var clubsDb = levelcache();
    var usersDb = levelcache();

    cascadeDeleteTestPayload.createdPlayers.push({ email: playerEmail });
    cascadeDeleteTestPayload.createdPlayers.push({ email: 'ken.daglish@wk.com.au' });
    cascadeDeleteTestPayload.createdSquads.push({ clubname: clubname, cityname: cityname, squadname: squadname, season: season });
    cascadeDeleteTestPayload.createdSquads.push({ clubname: clubname, cityname: cityname, squadname: 'reserves', season: season });
    cascadeDeleteTestPayload.createdSquadPlayers.push({ squadname: squadname, season: season, email: playerEmail });
    cascadeDeleteTestPayload.createdSquadPlayers.push({ squadname: squadname, season: season, email: 'kdaglish@wk.com.au' });
    cascadeDeleteTestPayload.createdClubs.push({ club: clubname, city: cityname });
    cascadeDeleteTestPayload.createdClubs.push({ club: 'Alkimos Surfers', city: cityname });
    cascadeDeleteTestPayload.createdUsers.push({ email: adminemail });
    cascadeDeleteTestPayload.createdUsers.push({ email: playerEmail });
    cascadeDeleteTestPayload.stubDelPlayersDb = sandbox.stub(playersDb, 'del');
    cascadeDeleteTestPayload.stubDelSquadsDb = sandbox.stub(squadsDb, 'del');
    cascadeDeleteTestPayload.stubDelSquadPlayersDb = sandbox.stub(squadPlayersDb, 'del');
    cascadeDeleteTestPayload.stubDelClubsDb = sandbox.stub(clubsDb, 'del');
    cascadeDeleteTestPayload.stubDelUsersDb = sandbox.stub(usersDb, 'del');
    var dbs = { 
      playersDb: playersDb,
      squadsDb: squadsDb,
      squadPlayersDb: squadPlayersDb,
      clubsDb: clubsDb,
      usersDb: usersDb
    };
    return dbs;
  }
  
  function assertCascadeDeleteCompletesWhenNothingToDelete() {
    callbackCalledWithNoError();
  }
  
  function assertCascadeDeleteRemovedItemsFromDatabases(cascadeDeleteTestPayload) {

    var createdPlayers = cascadeDeleteTestPayload.createdPlayers;
    if (createdPlayers) {
      assert(createdPlayers.length > -1, 'Where are the players to test with!');
      for (var i = 0; i < createdPlayers.length; i++) 
        assert(cascadeDeleteTestPayload.stubDelPlayersDb.calledWith(createdPlayers[i].email, { sync: true }), 'Call to remove the player ' + createdPlayers[i].email + ' was not enacted');
    } else
      console.log('We do not have any players to remove for this test. Is that Ok?');
      
    var createdSquads = cascadeDeleteTestPayload.createdSquads;
    if (createdSquads) {
      assert(createdSquads.length > -1, 'Where are the squads to test with!');
      for (var i = 0; i < createdSquads.length; i++) 
        assert(cascadeDeleteTestPayload.stubDelSquadsDb.calledWith(squadKey(createdSquads[i].squadname, createdSquads[i].season), { sync: true }), 
               'Call to remove the squad ' + createdSquads[i].squadname + ' was not enacted');
    } else
      console.log('We do not have any squads to remove for this test. Is that Ok?');  

    var createdSquadPlayers = cascadeDeleteTestPayload.createdSquadPlayers;
    if (createdSquadPlayers) {
      assert(createdSquadPlayers.length > -1, 'Where are the squad players to test with!');
      for (var i = 0; i < createdSquadPlayers.length; i++) 
        assert(cascadeDeleteTestPayload.stubDelSquadPlayersDb.calledWith(createdSquadPlayers[i].squadname + '~' + createdSquadPlayers[i].season + '~' + createdSquadPlayers[i].email, { sync: true }), 
               'Call to remove the squad player ' + createdSquadPlayers[i].email + ' was not enacted');
    } else
      console.log('We do not have any squad players to remove for this test. Is that Ok?');  

    var createdClubs = cascadeDeleteTestPayload.createdClubs;  
    if (createdClubs) {
      assert(createdClubs.length > -1, 'Where are the clubs to test with!');
      for (var i = 0; i < createdClubs.length; i++) 
        assert(cascadeDeleteTestPayload.stubDelClubsDb.calledWith(createdClubs[i].club + '~' + createdClubs[i].city, { sync: true }), 'Call to remove the club ' + createdClubs[i].club + ' in city ' + createdClubs[i].city);
    } else
      console.log('We do not have any clubs to remove for this test. Is that Ok?');
      
    var createdUsers = cascadeDeleteTestPayload.createdUsers;   
    if (createdUsers) {
      assert(createdUsers.length > -1, 'Where are the clubs to test with!');
      for (var i = 0; i < createdUsers.length; i++) 
        assert(cascadeDeleteTestPayload.stubDelUsersDb.calledWith(createdUsers[i].email, { sync: true }), 'Call to remove user ' + createdUsers[i].email + 'was not enacted');
    }
    else
      console.log('We do not have any users to remove for this test. Is that Ok?');
      
    callbackCalledWithNoError();
  }
  
  function assertCreatedTheSquad(clubname, cityname, squadname, season, agelimit, adminemail, createdSquads, checkCallBack) {
    assert(stubPut.calledWith(squadname + '~' + season, { agelimit: agelimit, admin: adminemail }, { sync: true }), 'create squad put not called with correct parameters');
    if (checkCallBack) 
      assert(callbackCalledWithNoError(), 'Callback not called after saving the squad');
    else
      assert(spyCallback.callCount === 0, 'Callback should not called after saving the squad');
    assert(_.find(createdSquads, function(s) { return s.club === clubname && s.city === cityname && s.squad === squadname && 
                                                      s.season === season && s.agelimit === agelimit && s.admin === adminemail; }), 'Squad not found in array');
  }
  
  function assertCreatedTheClub(clubname, cityname, fieldname, suburbname, adminemail, createdClubs, checkCallBack) {
    assert(stubPut.calledWith(clubname + '~' + cityname, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }), 'create club put not called with correct parameters');
    if (checkCallBack) 
      assert(callbackCalledWithNoError(), 'Callback not called after saving the club');
    else
      assert(spyCallback.callCount === 0, 'Callback should not called after saving the club');
    assert(_.find(createdClubs, function(c) { return c.club === clubname && c.city === cityname && c.field === fieldname && c.suburb === suburbname && c.admin === adminemail; }), 'Club not found in array');
  }
  
  function assertCreatedThePlayer(email, firstname, surname, DOB, address, suburb, postcode, phone, createdPlayers, checkCallBack) {
    assert(stubPut.calledWith(email, { dob: DOB, address: address, suburb: suburb, postcode: postcode, phone: phone }, { sync: true }), 'create player put not called with correct parameters');
    if (checkCallBack) 
      assert(callbackCalledWithNoError(), 'Callback not called after saving the player');
    else
      assert(spyCallback.callCount === 0, 'Callback should not called after saving the player');
    assert(_.find(createdPlayers, function(c) { return c.email === email && c.address === address && c.suburb === suburb && 
                                                       c.postcode === postcode && c.phone === phone; }), 'Phone not found in array');
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
    assert(stubGet.calledWith(squadKey(squadname, season)), 'get not called with correct parameters');
    assert(spyCallback.calledWith({ club: clubname, city: cityname, squad: squadname, season: season, agelimit: agelimit, creator: adminemail }), 'Did not receive the callback');
  }
  
  function assertRemovedTheSquad(clubname, cityname, squadname, season) {
    assert(stubDel.calledWith(squadKey(squadname, season), { sync: true }), 'delete not called with correct parameters');
    assert(spyCallback.called, 'Did not receive the callback');
  }
  
  function assertRemovedTheSquadWithoutACallback(clubname, cityname, squadname, season) {
    assert(stubDel.calledWith(squadKey(squadname, season), { sync: true }), 'delete not called with correct parameters');
    assert(!spyCallback.called, 'Should not receive the callback');
  }
  
  function assertRemoveSquadReportsErrorViaCallback(expectedError) {
    assert(spyCallback.calledWith(expectedError), 'Callback needs to be called with the expectedError: ' + expectedError.message);
  }

  function assertRemovedTheSquadPlayer(squadname, season, email) {
    assert(stubDel.calledWith(squadname + '~' + season + '~' + email, { sync: true }), 'delete not called with correct parameters');
    assert(spyCallback.called, 'Did not receive the callback');
  }
  
  function assertRemovedTheSquadPlayerWithoutACallback(squadname, season, email) {
    assert(stubDel.calledWith(squadname + '~' + season + '~' + email, { sync: true }), 'delete not called with correct parameters');
    assert(!spyCallback.called, 'Should not receive the callback');
  }
  
  function assertRemoveSquadPlayerReportsErrorViaCallback(expectedError) {
    assert(spyCallback.calledWith(expectedError), 'Callback needs to be called with the expectedError: ' + expectedError.message);
  }

  function assertRemovedThePlayer(playerEmail) {
    assert(stubDel.calledWith(playerEmail, { sync: true }), 'delete not called with correct parameters');
    assert(spyCallback.called, 'Did not receive the callback');
  }
  
  function assertRemovedThePlayerWithoutACallback(email) {
    assert(stubDel.calledWith(playerEmail, { sync: true }), 'delete not called with correct parameters');
    assert(!spyCallback.called, 'Should not receive the callback');
  }
  
  function assertRemovePlayerReportsErrorViaCallback(expectedError) {
    assert(spyCallback.calledWith(expectedError), 'Callback needs to be called with the expectedError: ' + expectedError.message);
  }
  
  function callbackCalledWithNoError() {
    return spyCallback.calledWith(sinon.match.falsy);
  }

  function squadKey(squadname, season) {
    return squadname + '~' + season; 
  }
  
});