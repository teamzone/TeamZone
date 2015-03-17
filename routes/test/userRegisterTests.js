/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var user = require('../userRegister');
var sinon = require('sinon');
var assert = require('assert');
var usermanagementservice = require('../../lib/UserManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');
var expressValidator = require('express-validator')();

describe("Testing of expressjs route for user register", function () {
    //1. Module Setup
    var u,
        sandbox,
        stubRegister,
        umsResponse,
        ums,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy;

    beforeEach(function () {
        ums = new usermanagementservice(null, null, null, null);
        incomingExpressRequest = {
            body: { email: 'rob@wk.com.au', password: 'AussieInternational' },
            session: { authenticated: false, user: null }
        };
        expressValidator(incomingExpressRequest, {}, function () {
            console.log('Unit Test Stub - Validation performed');
        });

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubRegister = sandbox.stub(ums, 'RegisterUser');
        umsResponse = { };
        stubRegister.yields(null, umsResponse);
        outgoingExpressResponse = {
            redirect: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); },
            render: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); }
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');

        //this will be setup to be injected soon enough
        u = new user(ums);
    });

    function assertRegisterVerifiedAndViewUpdated(redirectView, spy, alertType, messages) {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
            type: alertType,
            messages: messages
        }}));
    }

    function enactRequestBodyValidationTest(incomingExpressRequest, expectedMessage, done) {
        //2. exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertRegisterVerifiedAndViewUpdated('register', outgoingExpressResponseSpy, 'alert-danger', expectedMessage);

        //4. teardown
        done();
    }

    //2. Module Exercise

    it("Registers a valid user", function (done) {
        //setup
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        //verify
        assertRegisterVerifiedAndViewUpdated('login', outgoingExpressResponseSpy, 'alert-success', [{ msg: 'Please check your email to verify your registration. Then you will be ready to log in!' }]);
        //teardown
        done();
    });

    it("Notifies via response when an error during registration service occurs", function (done) {
        //1. setup - changing the default behaviour
        var expectedErrorMessage = 'User Registration Service Failure',
            expectedError = new Error(expectedErrorMessage);
        stubRegister.yields(expectedError);

        //2. exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertRegisterVerifiedAndViewUpdated('register', outgoingExpressResponseSpy, 'alert-danger', [{ msg: expectedErrorMessage }]);

        //4. teardown
        done();
    });

    it("Notification of missing password error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.password = '';
        //2. Exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Password is required' }, { msg: 'Password length needs to be at least 8 characters' }], done);
    });

    it("Notification of password being too short error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.password = '12';
        //2. Exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Password length needs to be at least 8 characters' }], done);
    });

    it("Notification of missing email error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.email = '';
        //2. Exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Email is required' }, {msg: 'Email does not appear to be valid'}], done);
    });

    it("Notification of invalid email error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.email = '---';
        //2. Exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Email does not appear to be valid' }], done);
    });

    //3. Module Verify

    //4. Module Cleanup    
    afterEach(function () {
        sandbox.restore();
    });

});