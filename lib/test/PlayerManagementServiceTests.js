/*jslint nomen: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, _ */
'use strict';

var assert = require('assert'); // built-in node lib
var async = require('async')
var levelcache = require('level-cache');
var sinon = require('sinon');
require('mocha-sinon');
var Pms = require('../PlayerManagementService'); // The library that you wish to test 

describe("Player Management Service Unit Tests", function() {

  var pms,
      imdb,
      levelimdb,
      stubGet,
      stubClose,
      testPlayer,
      spyPut,
      callback;

  beforeEach(function()  {
      pms = new Pms();
      imdb = levelcache();
      levelimdb = levelcache();
      stubClose = sinon.stub(levelimdb, 'close');
      callback = sinon.spy();

      testPlayer = { 
          team: 'Western Knight 1st Team',
          firstname: 'Niko',
          surname: 'Kranjcar',
          dob: '01 JAN 2001',
          address: '1 Testing Way',
          suburb: 'Moolabah',
          postcode: '4059',
          phone: '09722722',
          email: 'niko@wk.com'
       };
  })

  afterEach(function()  {
      
  })

  it("Should save a valid player to the data store", function(done) {

      spyPut = sinon.spy(imdb, 'put');
      stubGet = sinon.stub(imdb, 'get');
      pms.Open(imdb, levelimdb);
      
      stubGet.yields();
      
      pms.AddPlayer(testPlayer.team, testPlayer.firstname, testPlayer.surname, testPlayer.dob, testPlayer.address, testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, callback);

      CheckHappyPathStubs();

      done();
  });

  it("Should be able to retrieve one player", function(done) {

      stubGet = sinon.stub(imdb, 'get');
      pms.Open(imdb, levelimdb);
      
      stubGet.yields(null, { dob: testPlayer.dob, address: testPlayer.address, suburb: testPlayer.suburb, postcode: testPlayer.postcode, phone: testPlayer.phone, email: testPlayer.email });
      
      pms.GetPlayer(testPlayer.team, testPlayer.firstname, testPlayer.surname, callback);

      assert(stubGet.calledOnce, 'get should have been called');
      assert(stubClose.calledOnce, 'close should have been called');
      assert(callback.calledOnce, 'Callback not called');
      assert(callback.args[0][0] === null, 'Not expecting an error');
      CheckPlayerResult(callback.args[0][1], testPlayer);

      done();
  });
 
  it("Should not be able to retrieve a player that does not exist", function(done) {

      stubGet = sinon.stub(imdb, 'get');
      pms.Open(imdb, levelimdb);
            
      stubGet.yields(new Error('Notfound'), null);

      pms.GetPlayer(testPlayer.team, testPlayer.firstname, testPlayer.surname, callback);

      assert(stubGet.calledOnce, 'get should have been called');
      assert(stubClose.calledOnce, 'close should have been called');
      assert(callback.calledOnce, 'Callback not called');
      assert(callback.args[0][0] !== null, 'Expecting an error');

      done();
  });

  it("Should throw an error when a player with the same first name, surname for a team already exists", function(done) {
      
      spyPut = sinon.spy(imdb, 'put');
      stubGet = sinon.stub(imdb, 'get');
      pms.Open(imdb, levelimdb);

      stubGet.yields().yields(null, { dob: testPlayer.dob, address: testPlayer.address, suburb: testPlayer.suburb, postcode: testPlayer.postcode, phone: testPlayer.phone, email: testPlayer.email });;
      
      pms.AddPlayer(testPlayer.team, testPlayer.firstname, testPlayer.surname, testPlayer.dob, testPlayer.address, testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, callback);

      assert(stubGet.calledOnce, 'get should have been called');
      assert(!spyPut.calledOnce, 'put should not have been called');
      assert(stubClose.calledOnce, 'close should have been called');
      assert(callback.calledOnce, 'Callback not called');
      assert(callback.args[0][0] !== null, 'expecting an error');
      assert.equal(callback.args[0][0].message, 'Cannot add this player, the player already exists', 'Unexpected error message');

      done();
  });

  async.each(['200/1/2001','12 MMM 1930','aa BBB 2000', 'zzz', '12 Ded 1988', '', 'sss'], function(dob, asyncdone) {
      it("Should throw an error when adding valid player, except for DOB of " + dob, function(done) {

        stubGet = sinon.stub(imdb, 'get');

        var pms = new Pms();
        pms.Open(imdb, levelimdb);

        pms.AddPlayer(testPlayer.team, testPlayer.firstname, testPlayer.surname, dob, testPlayer.address, testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, callback);
        assert(callback.args[0][0] !== null, 'expecting an error');
        assert.equal(callback.args[0][0].message, 'The date is in an incorrect format', 'Incorrect error was throw');
        assert(!stubGet.called, 'get should not have been called');
        done();
      })
      asyncdone();
  });

    async.each(['12 DEC 2000', '12 Dec 2000','1 Dec 2000','1/1/2000', '01/01/2000', '01-01-2000', '12-Dec-2000', '1999-01-01'], function(dob, asyncdone) {
      it("Should allow adding valid player, with multiple valid date formats for dob " + dob, function(done) {

          spyPut = sinon.spy(imdb, 'put');
          stubGet = sinon.stub(imdb, 'get');
          pms.Open(imdb, levelimdb);
      
          stubGet.yields();
      
          pms.AddPlayer(testPlayer.team, testPlayer.firstname, testPlayer.surname, dob, testPlayer.address, testPlayer.suburb, testPlayer.postcode, testPlayer.phone, testPlayer.email, callback);

          CheckHappyPathStubs();
          done();

      })
      asyncdone();
  });

  function CheckHappyPathStubs()
  {
      assert(stubGet.calledOnce, 'get should have been called');
      assert(spyPut.calledOnce, 'put should have been called');
      assert(stubClose.calledOnce, 'close should have been called');
      assert(callback.calledOnce, 'Callback not called');
      assert(callback.args[0][0] === null, 'Not expecting an error');
  }

  function CheckPlayerResult(actual, expected)
  {
      assert.equal(actual.teamname, expected.team, 'team name not set');
      assert.equal(actual.firstname, expected.firstname, 'firstname not set');
      assert.equal(actual.surname, expected.surname, 'surname not set');
      assert.equal(actual.address, expected.address, 'address not set');
      assert.equal(actual.dob, expected.dob, 'dob not set');
      assert.equal(actual.suburb, expected.suburb, 'suburb not set');
      assert.equal(actual.postcode, expected.postcode, 'postcode not set');
      assert.equal(actual.phone, expected.phone, 'phone not set');
      assert.equal(actual.email, expected.email, 'email not set');
   }

});