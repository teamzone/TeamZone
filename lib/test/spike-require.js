var assert = require('assert'),
    require = require('requirejs');

var Pms = require('../PlayerManagementService'); 

describe("Trying out requirejs for DI", function() {
    
  before(function() {
    require.config({
        paths: {
            'jQuery': 'vendor/jquery-1.9.0.min',
            'underscore': 'vendor/underscore-1.9.min'
        },
        shim: {
            'jQuery': {
                exports: '$'
            },
            'underscore': {
                exports: '_'
            }
        }
    });
  })

  beforeEach(function()  {
        
  })

  afterEach(function()  {
      
  })

  it("Example of RequireJS Dependency Injection", function(done) {
    done();
  });

});