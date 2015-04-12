/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var assert = require('assert'); // built-in node lib
var async = require('async');
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
var Pms = require('../PlayerManagementService'); // The library that you wish to test 

describe("Player Management Service Unit Tests", function () {
    // 1. Module Setup
    var pms,
        imdb,
        stubGet,
        testPlayer,
        sandbox,
        stubPut,
        spyCallback;

    beforeEach(function () {
        setupTest();
    });

    function setupTest() {
        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();

        imdb = levelcache();
        pms = new Pms(imdb);
        spyCallback = sinon.spy();

        testPlayer = {
            clubname: 'Western Knight 1st Team',
            cityname: 'Perth',
            firstname: 'Niko',
            lastname: 'Kranjcar',
            dob: '01 JAN 2001',
            address: '1 Testing Way',
            suburb: 'Moolabah',
            postcode: '4059',
            phone: '09722722',
            email: 'niko@wk.com'
        };
        
        stubPut = sandbox.stub(imdb, 'put');
        stubGet = sandbox.stub(imdb, 'get');
        stubGet.yields();
    }
    
    function callbackCalledWithNoError() {
        return !spyCallback.calledWith(sinon.match.instanceOf(Error));
    }

    function callbackCalledWithError(optionalMessage) {
        var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error)),
            messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
        return calledWithError && messageMatches;
    }

    function assertPlayerAdded(dob) {
        assert(stubGet.calledOnce, 'get should have been called');
        assert(stubPut.calledOnce, 'put should have been called');
        var dobToCheck = testPlayer.dob;
        if (dob)
            dobToCheck = dob;
        assert(stubPut.calledWith(testPlayer.clubname + '~' + testPlayer.cityname + '~' + testPlayer.email, 
                        { 
                            firstname: testPlayer.firstname, lastname: testPlayer.lastname, dob: dobToCheck, address: testPlayer.address, 
                            suburb: testPlayer.suburb, postcode: testPlayer.postcode, phone: testPlayer.phone, email: testPlayer.email 
                        }, { sync: true }), 'The put parameters were not correct');
        assert(callbackCalledWithNoError(), 'Failure on callback');
    }

    function assertGetsPlayerFromStorage(actual, expected) {
        assert(stubGet.calledOnce, 'get should have been called');
        assert(callbackCalledWithNoError(), 'Failure on callback');
        assert.equal(actual.clubname, expected.clubname, 'club name not set');
        assert.equal(actual.cityname, expected.cityname, 'city name not set');
        assert.equal(actual.firstname, expected.firstname, 'firstname not set');
        assert.equal(actual.lastname, expected.lastname, 'lastname not set');
        assert.equal(actual.address, expected.address, 'address not set');
        assert.equal(actual.dob, expected.dob, 'dob not set');
        assert.equal(actual.suburb, expected.suburb, 'suburb not set');
        assert.equal(actual.postcode, expected.postcode, 'postcode not set');
        assert.equal(actual.phone, expected.phone, 'phone not set');
        assert.equal(actual.email, expected.email, 'email not set');
    }

    function assertGetPlayerReturnsNotFoundError() {
        assert(stubGet.calledOnce, 'get should have been called');
        assert(callbackCalledWithError(), 'Did not receive the error');
    }
    
    // 2. Module Exercise

    it("Should save a valid player to the data store", function (done) {
        // 1. Setup

        // 2. Exercise
        pms.AddPlayer(testPlayer.clubname, testPlayer.cityname, testPlayer.firstname, testPlayer.lastname, testPlayer.dob, testPlayer.address, 
                      testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, spyCallback);

        // 3. Verify
        assertPlayerAdded();

        // 4. Teardown
        done();
    });

    it("Should be able to retrieve one player", function (done) {

        stubGet.yields(null, { firstname: testPlayer.firstname, lastname: testPlayer.lastname, dob: testPlayer.dob, address: testPlayer.address, 
                               suburb: testPlayer.suburb, postcode: testPlayer.postcode, phone: testPlayer.phone, email: testPlayer.email });

        pms.GetPlayer(testPlayer.clubname, testPlayer.cityname, testPlayer.email, spyCallback);

        assertGetsPlayerFromStorage(spyCallback.args[0][1], testPlayer);

        done();
    });

    it("Should not be able to retrieve a player that does not exist", function (done) {

        stubGet.yields(new Error('Notfound'), null);

        pms.GetPlayer(testPlayer.clubname, testPlayer.cityname, testPlayer.email, spyCallback);

        assertGetPlayerReturnsNotFoundError();

        done();
    });

    it("Should throw an error when a player with the same first name, surname for a team already exists", function (done) {

        stubGet.yields().yields(null, { dob: testPlayer.dob, address: testPlayer.address, suburb: testPlayer.suburb, postcode: testPlayer.postcode, phone: testPlayer.phone, email: testPlayer.email });

        pms.AddPlayer(testPlayer.clubname, testPlayer.cityname, testPlayer.firstname, testPlayer.surname, testPlayer.dob, testPlayer.address, testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, spyCallback);

        assert(stubGet.calledOnce, 'get should have been called');
        assert(!stubPut.calledOnce, 'put should not have been called');
        assert(spyCallback.calledOnce, 'Callback not called');
        assert(spyCallback.args[0][0] !== null, 'expecting an error');
        assert.equal(spyCallback.args[0][0].message, 'Cannot add this player, the player already exists', 'Unexpected error message');

        done();
    });

    async.each(['200/1/2001', '12 MMM 1930', 'aa BBB 2000', 'zzz', '12 Ded 1988', '', 'sss'], function (dob, asyncdone) {
        it("Should throw an error when adding valid player, except for DOB of " + dob, function (done) {

            setupTest();
            
            pms.AddPlayer(testPlayer.clubname, testPlayer.cityname, testPlayer.firstname, testPlayer.surname, dob, testPlayer.address, 
                          testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, spyCallback);
                          
            assert(callbackCalledWithError('The date is in an incorrect format'), 'Incorrect error was throw');
            assert(!stubGet.called, 'get should not have been called');
            
            done();
        });
        asyncdone();
    });

    async.each(['12 DEC 2000', '12 Dec 2000', '1 Dec 2000', '1/1/2000', '01/01/2000', '01-01-2000', '12-Dec-2000', '1999-01-01'], function (dob, asyncdone) {
        it("Should allow adding valid player, with multiple valid date formats for dob " + dob, function (done) {
            
            setupTest();
            
            pms.AddPlayer(testPlayer.clubname, testPlayer.cityname, testPlayer.firstname, testPlayer.lastname, dob, testPlayer.address, 
                      testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, spyCallback);

            assertPlayerAdded(dob);
            done();
        });
        asyncdone();
    });

    //3. Module Verify

    //4. Module Cleanup
    afterEach(function () {
        sandbox.restore();
    });    
});