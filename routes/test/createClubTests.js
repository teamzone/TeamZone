/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var createclub = require('../createClub');
var sinon = require('sinon');
var assert = require('assert');
var teammanagementservice = require('../../lib/TeamManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');
var expressValidator = require('express-validator')();

describe("Testing of expressjs route for create a club", function () {
    //1. Module Setup
    var cc,
        sandbox,
        stubCreateClub,
        tms,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy;

    beforeEach(function () {

        tms = new teammanagementservice(null);
        incomingExpressRequest = {
            body: { clubname: 'Western Knights', cityname: 'Perth', suburbname: 'Mosman Park', fieldname: 'Nash Field', adminemail: 'mel.taylor-gainsford@wk.com.au' },
            session: { authenticated: true, user: { } }
        };
        expressValidator(incomingExpressRequest, {}, function () {
            console.log('Unit Test Stub - Validation performed');
        });

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubCreateClub = sandbox.stub(tms, 'CreateClub');
        stubCreateClub.yields(null);
        outgoingExpressResponse = {
            redirect: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); },
            render: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); }
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');

        //this will be setup to be injected soon enough
        cc = new createclub(tms);
    });

    function assertClubCreatedAndViewUpdated(redirectView, spy, alertType, messages) {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
            type: alertType,
            messages: messages
        }}));
    }

    function enactRequestBodyValidationTest(incomingExpressRequest, expectedMessage, done) {
        //2. exercise
        cc.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertClubCreatedAndViewUpdated('createClub', outgoingExpressResponseSpy, 'alert-danger', expectedMessage);

        //4. teardown
        done();
    }

    //2. Module Exercise

    it("Create a valid club", function (done) {
        //1. setup

        //2. exercise
        cc.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertClubCreatedAndViewUpdated('manageClub', outgoingExpressResponseSpy,
            'alert-success',
            [{ msg: 'Club has been successfully created.  You can now manage the club to add teams, squads and players and all the other functions needed to run the club.' }]);

        //4. teardown
        done();
    });

    it("Notifies via response when an error during call to createClub in service", function (done) {
        //1. setup - changing the default behaviour
        var expectedErrorMessage = 'Create Club Service Failure',
            expectedError = new Error(expectedErrorMessage);
        stubCreateClub.yields(expectedError);

        //2. exercise
        cc.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertClubCreatedAndViewUpdated('createClub', outgoingExpressResponseSpy, 'alert-danger', [{ msg: expectedErrorMessage }]);

        //4. teardown
        done();
    });

    it("Notification of missing club name error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.clubname = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Club name is required' }], done);
    });

    it("Notification of missing city name error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.cityname = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'City is required' }], done);
    });

    it("Notification of missing suburb name error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.suburbname = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Suburb is required' }], done);
    });

    it("Notification of missing field name error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.fieldname = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Field is required' }], done);
    });

    it("Notification of missing email error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.adminemail = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Administrator Email is required' }, {msg: 'Administrator Email does not appear to be valid'}], done);
    });

    it("Notification of invalid admin email error", function (done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body.adminemail = '---';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Administrator Email does not appear to be valid' }], done);
    });

    //3. Module Verify

    //4. Module Cleanup
    afterEach(function () {
        sandbox.restore();
    });
});