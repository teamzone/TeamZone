var sinon = require('sinon');
var index = require('../index');
var require = require('requirejs');
//require.config({
//    //baseUrl: __dirname + "/../src",
//    packages: [
//        {
//            name: "squirejs",
//            location: "../node_modules/squirejs",
//            main: "src/Squire"
//        }
//    ]
//});


var Squire = require('squirejs');
require('mocha-sinon');

//define(['Squire'], function(Squire) {
//  var injector = new Squire();
//});

describe("Testing of expressjs routes for UI", function() {

  //var injector = new Squire();
  var callback;

  beforeEach(function()  {

      callback = sinon.spy();

      testPlayer = { 
          team: 'Western Knights 1st Team',
          firstname: 'Niko',
          surname: 'Kranjcar',
          dob: '01 JAN 2001',
          address: '1 Testing Way',
          suburb: 'Moolabah',
          postcode: '4059',
          phone: '09722722',
          email: 'niko@wk.com'
       };

       //injector
       // .store('PMS')
       // .require('../../lib/PlayerManagementService', function(PlayerManagementService, mocks) {
       //     sinon.stub(mocks.PMS, 'Open');
       //     sinon.stub(mocks.PMS, 'AddPlayer');
       // });

  })

  afterEach(function()  {
      //injector.clean();
  })

  it("Should call AddPlayer service to save a valid player", function(done) {

      
      done();
  });

});