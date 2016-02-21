/*jslint node: true */
/*jslint nomen: true */
/*jslint newcap: true */
/*jshint expr: true*/
/*global before, beforeEach, afterEach, after, describe, it */
'use strict';

var user = require('../userConfirm');
var sinon = require('sinon');
var usermanagementservice = require('../../lib/ts/UserManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
chai.should();
chai.use(sinonChai);
require('mocha-sinon');

describe("Testing of expressjs route for user confirmation: ", function () {

    //1. Module Setup
    var u,
        sandbox,
        stubConfirm,
        umsResponse,
        ums,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressRenderSpy;

    beforeEach(function () {
        ums = new usermanagementservice(null, null, null, null);
        incomingExpressRequest = {
            query: { u: 'rob@wk.com.au', t: 'UniqueTokenString' },
            session: { authenticated: false, user: null }
        };

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubConfirm = sandbox.stub(ums, 'ConfirmRegisterUser');
        umsResponse = { };
        stubConfirm.yields(null, umsResponse);
        outgoingExpressResponse = {
            render: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); }
        };
        outgoingExpressRenderSpy = sandbox.spy(outgoingExpressResponse, 'render');

        //this will be setup to be injected soon enough
        u = new user(ums);
    });

    function assertUserServiceConfirmed(redirectView, spy, alertType, message) {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
            type: alertType,
            messages: [{ msg: message }]
        }}));
    }

    function assertQueryParameterMissing() {
        outgoingExpressRenderSpy.should.have.been.calledWith('login', sinon.match({ flash: {
            type: 'alert-danger',
            messages: [{ msg: 'Invalid confirmation url' }]
        }}));
    }

    //2. Module Exercise
    it("Confirm a valid user", function (done) {
        //1. setup

        //2. exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertUserServiceConfirmed('login', outgoingExpressRenderSpy, 'alert-success', 'You have been successfully confirmed, please log in.');

        //4. teardown
        done();
    });

    it("Reject blank query parameter - u", function (done) {
        //1 . setup
        incomingExpressRequest = {
            query: { t: 'UniqueTokenString' },
            session: { authenticated: false, user: null }
        };

        //2. exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertQueryParameterMissing('u');

        //4. teardown
        done();
    });

    it("Reject blank query parameter - t", function (done) {
        //1. setup
        incomingExpressRequest = {
            query: { u: 'rob@mu.co.uk' },
            session: { authenticated: false, user: null }
        };

        //2. exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertQueryParameterMissing('t');

        //4. teardown
        done();
    });

    it("Notifies via response when an error during confirmation service occurs", function (done) {
        //1. setup - changing the default behaviour
        var expectedErrorMessage = 'User Confirmation Service Failure',
            expectedError = new Error(expectedErrorMessage);
        stubConfirm.yields(expectedError);

        //2. exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertUserServiceConfirmed('login', outgoingExpressRenderSpy, 'alert-danger', expectedErrorMessage);

        //4. teardown
        done();
    });

    it("Post is not allowed, so throw an error", function (done) {
        //1. setup

        //2. exercise
        try {
            u.post(incomingExpressRequest, outgoingExpressResponse);
        } catch (e) {
            //3. verify
            e.message.should.equal('Post is not permitted for confirmation');
        }

        //4. teardown
        done();
    });

    //3. Module Verify

    //4. Module CleanUp
    afterEach(function () {
        sandbox.restore();
    });

});