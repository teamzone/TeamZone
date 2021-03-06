/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var assert = require('assert'); // built-in node lib
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
require('../../common/jsInject');
var squadmanagementservice = require('../SquadManagementService');
var createError = require('errno').create;
var NotFoundError = createError('NotFoundError');
NotFoundError.prototype.notFound = true;

describe("Squad Management Service - Add Player to Squad Unit Tests", function () {
    // 1. Module Setup
    var playersdb,
        squadsdb,
        squadplayersdb,
        sms,
        spyCallback,
        sandbox,
        $jsInject,
        playeremail,
        clubname,
        cityname,
        squadname,
        season,
        stubPut,
        stubGet,
        stubPlayerGet,
        stubSquadGet,
        errorNotFound;

    function injectDependenciesForService() {
        //use in memory db, some calls are mocked anyway - but this makes it easier anyway
        squadsdb = levelcache();
        playersdb = levelcache();
        squadplayersdb = levelcache();

        $jsInject = new $$jsInject();
        $jsInject.register("SquadManagementService", ["squads", "players", "squadplayers", squadmanagementservice]);
        $jsInject.register("squads", [function () { return squadsdb; }]);
        $jsInject.register("players", [function () { return playersdb; }]);
        $jsInject.register("squadplayers", [function () { return squadplayersdb; }]);

        //methods to tests are here with required dependencies passed through construction
        sms = $jsInject.get("SquadManagementService");
    }

    beforeEach(function () {
        //Setup that is used across all tests
        injectDependenciesForService();

        playeremail = 'kdaglish@gmail.com';
        clubname = 'Western Knights';
        cityname = 'Perth';
        squadname = '1st Team';
        season = '2015';

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

    function assertCallBackToClientCalledOnce() {
        var callbackcount = spyCallback.callCount;
        assert.equal(callbackcount, 1, 'Callback should only be called once, but was called ' + callbackcount + ' times');
    }

    function callbackCalledWithNoError() {
        assertCallBackToClientCalledOnce();
        return !spyCallback.calledWith(sinon.match.instanceOf(Error));
    }

    function callbackCalledWithError(optionalMessage) {
        assertCallBackToClientCalledOnce();
        var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error)),
            messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
        return calledWithError && messageMatches;
    }

    function assertPlayerGetErrorIsReported() {
        assert(callbackCalledWithError('Database Access Error'), 'Expected player get to report error');
    }

    function assertPlayerGetCalledCorrectly() {
        assert(stubPlayerGet.calledWith(clubname + '~' + cityname + '~' + playeremail), 'Check for player age was not correct');
    }

    function assertReturnedAgeLimitExceedError() {
        assertPlayerGetCalledCorrectly();
        assert(callbackCalledWithError('Player does not qualify for the squad due to being underaged'), 'Expected player to fail validation - too young');
    }

    function assertReturnedAgeLimitExceedPlayerTooOldError() {
        assertPlayerGetCalledCorrectly();
        assert(callbackCalledWithError('Player does not qualify for the squad due to being over age'), 'Expected player to fail validation - too old');
    }

    function assertReturnsErrorForMissingParameter(parametername) {
        assert(callbackCalledWithError('The argument ' + parametername + ' is a required argument'), 'Missing parameter ' + parametername);
    }

    function assertReturnsErrorForInvalidPlayerEmail() {
        assert(callbackCalledWithError('The player email is invalid'), 'Admin Email should have failed validation');
    }

    function assertPlayerAddedToSquad() {
        assertPlayerGetCalledCorrectly();
        assert(stubSquadGet.calledWith(clubname + '~' + cityname + '~' + squadname + '~' + season), 'The checking of the squad prior did not occur');
        assert(stubPut.calledWith(clubname + '~' + cityname + '~' + squadname + '~' + season + '~' + playeremail, { playeremail: playeremail }, { sync: true }), 'put not called with correct parameters');
        assert(callbackCalledWithNoError(), 'Callback not called after saving the squad');
        sinon.assert.callOrder(stubPlayerGet, stubSquadGet, stubPut, spyCallback);
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

    // 2. Module Exercise

    it('Can add a player to a squad', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback);

        // 3. Verify
        assertPlayerAddedToSquad();

        // 4. Cleanup/Teardown
        done();
    });

    it('Will not add a player to a squad when the player is too young', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubPlayerGet.yields(null, { dob: '20 Dec 2005' });

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback, 2014);

        // 3. Verify
        assertReturnedAgeLimitExceedError();

        // 4. Cleanup/Teardown
        done();
    });

    it('Will not add a player to a squad when the player is too young - using a long past target year like 1999', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubPlayerGet.yields(null, { dob: '20 Dec 1993' });

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback, 1999);

        // 3. Verify
        assertReturnedAgeLimitExceedError();

        // 4. Cleanup/Teardown
        done();
    });

    it('Will not add a player to a squad when the player is too old', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubPlayerGet.yields(null, { dob: '20 Dec 1991' });
        squadname = 'Under 14s';
        stubSquadGet.yields(null, { agelimit: 'under 14' });

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback, 2014);

        // 3. Verify
        assertReturnedAgeLimitExceedPlayerTooOldError();

        // 4. Cleanup/Teardown
        done();
    });

    it('Will report error when asking for player details during eligibility checking', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubPlayerGet.yields(new Error('Database Access Error'));

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback);

        // 3. Verify
        assertPlayerGetErrorIsReported();

        // 4. Cleanup/Teardown
        done();
    });

    it('Will report error when asking for squad details during eligibility checking', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubSquadGet.yields(new Error('Database Access Error'));

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback);

        // 3. Verify
        assertPlayerGetErrorIsReported();

        // 4. Cleanup/Teardown
        done();
    });

    it('Returns error squadname parameter is missing', function (done) {
        // 1. Setup

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, null, season, playeremail, spyCallback);

        // 3. Verify
        assertReturnsErrorForMissingParameter('squadname');

        // 4. Cleanup/Teardown
        done();
    });

    it('Returns error season parameter is missing', function (done) {
        // 1. Setup

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, '', playeremail, spyCallback);

        // 3. Verify
        assertReturnsErrorForMissingParameter('season');

        // 4. Cleanup/Teardown
        done();
    });

    it('Returns error player email parameter is missing', function (done) {
        // 1. Setup

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, undefined, spyCallback);

        // 3. Verify
        assertReturnsErrorForMissingParameter('playeremail');

        // 4. Cleanup/Teardown
        done();
    });

    it("Notification of invalid player email error", function (done) {
        // 1. Setup - changing the default behaviour

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, '---', spyCallback);

        // 3. Verify
        assertReturnsErrorForInvalidPlayerEmail();

        // 4. Cleanup/Teardown
        done();
    });

    it('Returns error if the same player is created within the same squad and season', function (done) {
        // 1. Setup

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback);

        // 3. Verify
        assertReturnsErrorWhenPlayerAlreadyExistsInSquad();

        // 4. Cleanup/Teardown
        done();
    });

    it('Returns error if checking for existance of the player in the squad fails because of db failure', function (done) {
        // 1. Setup
        var message = "General Database Failure";
        stubGet.yields(new Error(message));

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback);

        // 3. Verify
        assertReturnsErrorOnGeneralDatabaseFailure(message);

        // 4. Cleanup/Teardown
        done();
    });

    it('Returns error if when adding the new player to the squad fails to be saved to the database', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        var errormessage = "Database access failed";
        stubPut.yields(new Error(errormessage));

        // 2. Exercise
        sms.AddPlayerToSquad(clubname, cityname, squadname, season, playeremail, spyCallback);

        // 3. Verify
        assertReturnsErrorWhenNewSquadPlayerDoesNotGetSavedToTheDatabase(errormessage);

        done();
    });

    // 4. Module Teardown

    afterEach(function () {
        sandbox.restore();
    });

});