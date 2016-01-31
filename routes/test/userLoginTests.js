/*jslint node: true */
/*jslint nomen: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
'use strict';

var user = require('../userLogin');
var sinon = require('sinon');
var assert = require('assert');
var usermanagementservice = require('../../lib/ts/UserManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');

describe("Testing of expressjs route for user login", function () {

    // !. Module Setup
    var u,
        sandbox,
        stubLogin,
        umsResponse,
        ums,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy;

    beforeEach(function () {
        ums = new usermanagementservice(null, null, null, null);
        incomingExpressRequest = { body: { username: 'rob@mu.co.uk', password: 'AussieInternational' }, session: { authenticated: false, user: null }};
        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubLogin = sandbox.stub(ums, 'LoginUser');
        umsResponse = { loggedIn: true };
        stubLogin.yields(null, umsResponse);
        outgoingExpressResponse = {
            redirect: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); },
            render: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); }
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'redirect');
        //this will be setup to be injected soon enough
        u = new user(ums);
    });

    /* 
    *
    *  Assert function definitions used in the tests declared before the tests 
    *
    */
    function assertLoginVerifiedAndViewUpdated(url) {
        url = url || 'dashboard';
        expect(incomingExpressRequest.session.authenticated).to.equal(true);
        expect(incomingExpressRequest.session.user.email).to.equal(incomingExpressRequest.body.username);
        outgoingExpressResponseSpy.should.have.been.calledWith(url);
    }

    function assertLoginFailedAndViewUpdated(message, alertType) {
        expect(incomingExpressRequest.session.authenticated).to.equal(false);
        outgoingExpressResponseSpy.should.have.been.calledWith('login',
            sinon.match({ flash: {
                type: alertType,
                messages: [{ msg: message }]
            }}));
    }

    /*
    * 2. Module Exercise
    */
    it("Logs in a valid user", function (done) {
        //2. exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        //3. verify
        assertLoginVerifiedAndViewUpdated();
        //4. teardown
        done();
    });

    it("Will not log a user with invalid credentials", function (done) {
        //1. setup - changing default behaviour
        umsResponse = { loggedIn: false };
        stubLogin.yields(null, umsResponse);
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');
        //2. exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        //3. verify
        assertLoginFailedAndViewUpdated('Login failed.  You may need to still verify your account or incorrect username/password was entered', 'alert-info');
        //4. teardown
        done();
    });

    it("Reports an error on failure to login", function (done) {
        //1. setup - changing the default behaviour
        var expectedErrorMessage = 'Login Service Failure',
            expectedError = new Error(expectedErrorMessage);
        stubLogin.yields(expectedError);
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');
        //2. exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        //3. verify
        assertLoginFailedAndViewUpdated(expectedErrorMessage, 'alert-danger');
        //4. teardown
        done();
    });
    
    it("Redirects to the originally requested url", function(done) {
        //1. Setup
        incomingExpressRequest.query = {
            url: '/addPlayer'
        };
        
        // 2. Exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        
        // 3. verify
        assertLoginVerifiedAndViewUpdated('/addPlayer');
        
        // 4. teardown
        done();
    })

    //3. Module Verify

    //4. Module Cleanup
    afterEach(function () {
        sandbox.restore();
    });

});