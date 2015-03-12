var assert = require('assert'); 
var levelcache = require('level-cache');
var sublevel = require('level-sublevel');
var sinon = require('sinon');
require('mocha-sinon');
var databasefactory = require('../DatabaseFactory');

describe("Here we find tests for our database factory", function () {

    var sandbox;
    var sublevelDb;
    var stubSubLevel;
    var factory;
    
    beforeEach(function() {
      //sandbox to cleanup global spies
      sandbox = sinon.sandbox.create();

      sublevelDb = sublevel(levelcache());
      
      stubSubLevel = sandbox.stub(sublevelDb, 'sublevel');
      
      factory = new databasefactory();
    });

    afterEach(function()  {
      sandbox.restore();
    });
  
    it("Can get the squadDb", function () {
        //1. Setup
        var clubSublevelDb = sublevel(sublevelDb, 'clubs');
        stubSubLevel.returns(clubSublevelDb);
        //we can use a spy just to check the call, but we need a stub prior in order to know what is being spied upon
        var spyClubSubLevel = sandbox.spy(clubSublevelDb, 'sublevel');
        
        //2. Exercise
        var squadDb = factory.squaddb(sublevelDb);
        
        //3. Verify
        assert(stubSubLevel.calledWith('clubs'), 'To get the parent clubs we need the first sublevel, then from clubs the next sublevel which is squads can be retrieved');
        assert(squadDb !== clubSublevelDb, 'The squaddb will not be the same as the clubs db');
        assert(spyClubSubLevel.calledWith('squads'), 'The next item under clubs should call a sublevel to get squads');
        
        //4. Teardown
    });

    it("Can get the squadPlayersDb", function () {
        //1. Setup
        var clubSublevelDb = sublevel(sublevelDb, 'clubs');
        var squadSublevelDb = sublevel(clubSublevelDb, 'squads');
        stubSubLevel.returns(clubSublevelDb);
        //stub the next level as we want to replace with the item we are spying on
        var stubClubSubLevel = sandbox.stub(clubSublevelDb, 'sublevel');
        stubClubSubLevel.returns(squadSublevelDb);
        //we can use a spy just to check the call, but we need a stub prior in order to know what is being spied upon
        var spySquadPlayersSubLevel = sandbox.spy(squadSublevelDb, 'sublevel');
        
        //2. Exercise
        var squadplayerDb = factory.squadplayersdb(sublevelDb);
        
        //3. Verify
        assert(stubSubLevel.calledWith('clubs'), 'Clubs is the start and it looks like this is not where we have started. i.e. clubs -> squads -> squadplayers');
        assert(stubClubSubLevel.calledWith('squads'), 'To get the parent squads we need the second sublevel, then from squads the next sublevel which is squadplayers can be retrieved');
        assert(squadplayerDb !== squadSublevelDb, 'The squadplayerDb will not be the same as the squads db');
        assert(spySquadPlayersSubLevel.calledWith('squadplayers'), 'The next item under squads should call a sublevel to get squadplayers');
        
        //4. Teardown
    });

    it("Can get the playerDb", function () {
        //1. Setup
        var clubSublevelDb = sublevel(sublevelDb, 'clubs');
        stubSubLevel.returns(clubSublevelDb);
        //we can use a spy just to check the call, but we need a stub prior in order to know what is being spied upon
        var spyClubSubLevel = sandbox.spy(clubSublevelDb, 'sublevel');
        
        //2. Exercise
        var playerDb = factory.playerdb(sublevelDb);
        
        //3. Verify
        assert(stubSubLevel.calledWith('clubs'), 'To get the parent clubs we need the first sublevel, then from clubs the next sublevel which is players can be retrieved');
        assert(playerDb !== clubSublevelDb, 'The playerdb will not be the same as the clubs db');
        assert(spyClubSubLevel.calledWith('players'), 'The next item under clubs should call a sublevel to get players');
        
        //4. Teardown
    });

    it("Can get the clubDb", function () {
        //1. Setup
        //restore because we want to change from stub used for other tests, to a spy
        sandbox.restore();
        var spySubLevel = sandbox.spy(sublevelDb, 'sublevel');
        
        //2. Exercise
        var clubdb = factory.clubdb(sublevelDb);
        
        //3. Verify
        assert(spySubLevel.calledWith('clubs'), 'Clubs is the parent so should be created from top most sub level');
        assert(clubdb !== sublevelDb, 'The squaddb will not be the same as the clubs db');

        //4. Teardown
    });
    
});