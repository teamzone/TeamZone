var assert = require('assert'),
    spy = require('./jsMockito').spy,
    given = require('./jsMockito').given,
    anyFunction = require('./jsMockito').anyFunction;
var levelup = require('levelup');
var levelAzureDown = require('azureleveldown');
var sublevel = require('level-sublevel');

describe("Trying out Mockito", function() {
    
  var pms;
  var mockTeamsDb;
  var db;

  before(function() {

  })

  beforeEach(function()  {
        
  })

  afterEach(function()  {
      
  })

  it("Example of Mocktio")
  {
          //JsHamcrest.Integration.mocha();
    JsMockito.Integration.Mocha();

      db = spy(sublevel);
      teamsDb = db.sublevel('teams');
      console.log('mocked teamsdb %s', teamsDb);

  }

});