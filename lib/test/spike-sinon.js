var assert = require('assert'),
    chai = require('chai'),
    expect = chai.expect;
var levelup = require('levelup');
var levelAzureDown = require('azureleveldown');
var sublevel = require('level-sublevel'),
    SubDb = sublevel.SubDb;
var Pms = require('../PlayerManagementService'); // The library that you wish to test 

chai.use(require('sinon-chai'));
require('mocha-sinon');

describe("Trying out Sinon for mocking", function() {
    
  before(function() {

  })

  beforeEach(function()  {

    var mockSubDb = this.sinon.mock(SubDb);
    var mockedLevelUp = this.sinon.spy(levelup.exports, 'LevelUP');
    var db = sublevel(mockedLevelUp);
    this.sinon.stub(db, 'sublevel', function(){
      return mockSubDb;
    });
        
  })

  afterEach(function()  {
      
  })

  it("Example of Sinon Mocking", function(done) {

      var pms = new Pms();
      pms.Open();
      
  });

});