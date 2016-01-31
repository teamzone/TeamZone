/* jslint node: true */
"use strict";

var assert = require('assert');
var tokenService = require('../TokenService');

describe("Token Service.  The component integrates with the Dependency Injector. These are its Unit Tests", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should generate a token (Ensures that the secret value was set.  If not set then an error gets generated)", function (done) {
        //1. Setup
        //2. Exercise
        var token = tokenService.prototype.generate('a token');
        
        //3. Verify
        assert(token !== null, 'We expected a token to have been generated');    
        
        //4. Teardown
        done();
    });

});
