/*jslint nomen: true */
/* global before, afterEach, after, describe, it */
'use strict';

var user = require('../userLogin');
var sinon = require('sinon');
var assert = require('assert');
var usermanagementservice = require('../../lib/UserManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');

describe("Testing of expressjs route for user login", function() {

    var u,
        sandbox,
        stubLogin,
        umsResponse,
        ums,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy;
    
    before(function() {
    });
    
    beforeEach(function()  {
    
        ums = new usermanagementservice(null, null, null, null);
        
        incomingExpressRequest = { body: { username: 'rob@mu.co.uk', password: 'AussieInternational' }, session: { authenticated: false, user: null }};
      
        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubLogin = sandbox.stub(ums, 'LoginUser');
        umsResponse = { loggedIn: true };
        stubLogin.yields(null, umsResponse);
        outgoingExpressResponse = { 
            redirect: function(view) { }, 
            render: function(view) { } 
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'redirect');

        //this will be setup to be injected soon enough
        u = new user(ums);
    });

    afterEach(function()  {
        sandbox.restore();
    });

    it("Logs in a valid user", function(done) {
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertLoginVerifiedAndViewUpdated();
        
        //teardown
        done();
    });

    it("Will not log a user with invalid credentials", function(done) {
        //setup - changing default behaviour
        umsResponse = { loggedIn: false };
        stubLogin.yields(null, umsResponse);        
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');
        
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);

        //verify
        assertLoginFailedAndViewUpdated('Login failed.  You may need to still verify your account or incorrect username/password was entered', 'alert-info');

        done();
    });

    it("Reports an error on failure to login", function(done) {
        //setup - changing the default behaviour
        var expectedErrorMessage = 'Login Service Failure';
        var expectedError = new Error(expectedErrorMessage);
        stubLogin.yields(expectedError);
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');
        
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertLoginFailedAndViewUpdated(expectedErrorMessage, 'alert-danger');

        //teardown
        done();    
    });
    
    function assertLoginVerifiedAndViewUpdated()
    {
        expect(incomingExpressRequest.session.authenticated).to.equal(true);
        expect(incomingExpressRequest.session.user.email).to.equal(incomingExpressRequest.body.username);
        outgoingExpressResponseSpy.should.have.been.calledWith('dashboard');
    }

    function assertLoginFailedAndViewUpdated(message, alertType) {
        expect(incomingExpressRequest.session.authenticated).to.equal(false);
        outgoingExpressResponseSpy.should.have.been.calledWith('login', 
            sinon.match({ flash: {
                    type: alertType,
                    messages: [{ msg: message }]
                }    
            }));
    }
    
});