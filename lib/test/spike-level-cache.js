var assert = require('assert'),
    chai = require('chai'),
    expect = chai.expect;
var levelup = require('levelup');
var levelAzureDown = require('azureleveldown');
var sublevel = require('level-sublevel'),
    SubDb = sublevel.SubDb;
var Pms = require('../PlayerManagementService'); // The library that you wish to test 
var levelcache = require('level-cache');
var sinon = require('sinon');

describe("Trying out level-cache for mocking", function() {
    
  before(function() {

  })

  beforeEach(function()  {
        
  })

  afterEach(function()  {
      
  })

  it("Example of Sinon Mocking", function(done) {

      var pms = new Pms();
      var imdb = levelcache();
      var levelimdb = levelcache();
      spyPut = sinon.spy(imdb, 'put');
      stubGet = sinon.stub(imdb, 'get');
      stubClose = sinon.stub(levelimdb, 'close');
      pms.Open(imdb, levelimdb);
      
      var testTeam = 'Western Knight 1st Team';
      var testPlayerFirstName = 'Niko';
      var testPlayerSurname = 'Kranjcar';
      var dob = '01 JAN 2001';
      var address = '1 Testing Way';
      var suburb = 'Moolabah';
      var postcode = '4059';
      var phone = '09722722';
      var email = 'niko@wk.com';
      var callback = sinon.spy();

      stubGet.yields();
      
      pms.AddPlayer(testTeam, testPlayerFirstName, testPlayerSurname, dob, address, suburb, postcode, phone, email, callback);

      assert(stubGet.calledOnce, 'get should have been called');
      assert(spyPut.calledOnce, 'put should have been called');
      assert(stubClose.calledOnce, 'close should have been called');
      assert(callback.calledOnce, 'Callback not called');

      done();
  });

});