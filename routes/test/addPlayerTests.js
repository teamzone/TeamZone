/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
/*jshint expr: true*/
"use strict";

var addplayer = require('../addPlayer');
var sinon = require('sinon');
var playermanagementservice = require('../../lib/ts/PlayerManagementService');
var clubmanagementservice = require('../../lib/ts/ClubManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
chai.should();
chai.use(sinonChai);
require('mocha-sinon');
var expressValidator = require('express-validator')();

describe("Testing of expressjs route for adding a player to a club", function () {
    //1. Module Setup
    var ap,
        sandbox,
        stubAddPlayer,
        pms,
        clubms,
        incomingGetRequest,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy,
        stubGetClubs;

    beforeEach(function () {
        pms = new playermanagementservice(null);
        clubms = new clubmanagementservice(null);
        incomingGetRequest = {
            session: {
                user: { email: 'robdunn@aboutagile.com' }
            }
        };
        incomingExpressRequest = {
            body: { clubname: 'Western Knights', cityname: 'Perth',
                    firstname: 'Ken', lastname: 'Bacon', dob: '29 Dec 1991', address: '999 Millenium Way',
                    suburb: 'Mosman Park', postcode: '6021', phone: '9343 2213', email: 'ken.bacon@wk.com.au' },
            session: { authenticated: true, user: { } }
        };
        expressValidator(incomingExpressRequest, {}, function () {
            console.log('Unit Test Stub - Validation performed');
        });

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubAddPlayer = sandbox.stub(pms, 'AddPlayer');
        stubAddPlayer.yields(null);
        outgoingExpressResponse = {
            redirect: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); },
            render: function (view) { /* just a stub to be overridden by sinon */ console.log('This code for should not be executed in a unit test %s', view); }
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');
        
        stubGetClubs = sandbox.stub(clubms, 'GetClubs');
        stubGetClubs.yields(null, [{ club: 'Club1', city: 'City1' }]);

        //this will be setup to be injected soon enough
        ap = new addplayer(pms, clubms);
    });

    function assertViewUpdated(redirectView, spy, alertType, messages) {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
            type: alertType,
            messages: messages
        }}));
    }

    function assertPlayerCreatedAndViewUpdated(redirectView, spy, alertType, messages) {
        assertViewUpdated(redirectView, spy, alertType, messages);
        stubAddPlayer.should.have.been.called;
    }

    function assertPlayerValidationFailedViewUpdatedWithFailureMessage(redirectView, spy, alertType, messages) {
        assertViewUpdated(redirectView, spy, alertType, messages);
        stubAddPlayer.should.not.have.been.called;
    }

    function enactRequestBodyValidationTest(incomingExpressRequest, expectedMessage, done) {
        //2. exercise
        ap.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertPlayerValidationFailedViewUpdatedWithFailureMessage('addPlayer', outgoingExpressResponseSpy, 'alert-danger', expectedMessage);

        //4. teardown
        done();
    }

    function notifiesValidationErrors(propertyname, expectedMessage, done) {
        //1. setup - changing the default behaviour
        incomingExpressRequest.body[propertyname] = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: expectedMessage }], done);
    }
    
    function assertViewCreatedWithClubAndCity() {
        outgoingExpressResponseSpy.should.have.been.calledWith('addPlayer', { clubs: [{ club: 'Club1', city: 'City1'}]});
    }

    //2. Module Exercise
    
    it("Includes club and city of the current user", function (done) {
        //1. setup
        
        //2. exercise
        ap.get(incomingGetRequest, outgoingExpressResponse);
        
        //3. verify
        assertViewCreatedWithClubAndCity();
        
        //4. teardown
        done();
    });

    it("Shows the notClubAdmin view if not a club admin", function (done) {
        // 1. setup
        var error = {
            notFound: true,
            message: 'Could not find Club for admin: robdunn@aboutagile.com'
        };
        stubGetClubs.yields(error, []);

        // 2. exercise
        ap.get(incomingGetRequest, outgoingExpressResponse);

        // 3. verify
        outgoingExpressResponseSpy.should.have.been.calledWith('notClubAdmin');

        // 4. teardown
        done();
    });

    it("Add a valid player", function (done) {
        //1. setup

        //2. exercise
        ap.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertPlayerCreatedAndViewUpdated('addPlayer', outgoingExpressResponseSpy,
            'alert-success',
            [{ msg: 'Player has been successfully added.' }]);

        //4. teardown
        done();
    });

    it("Notifies via response when an error during call to addPlayer in service", function (done) {
        //1. setup - changing the default behaviour
        var expectedErrorMessage = 'Add Player Service Failure',
            expectedError = new Error(expectedErrorMessage);
        stubAddPlayer.yields(expectedError);

        //2. exercise
        ap.post(incomingExpressRequest, outgoingExpressResponse);

        //3. verify
        assertPlayerCreatedAndViewUpdated('addPlayer', outgoingExpressResponseSpy, 'alert-danger', [{ msg: expectedErrorMessage }]);

        //4. teardown
        done();
    });

    it("Notification of missing club name error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("clubname", "Club is required", done);
    });

    it("Notification of missing city name error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("cityname", "City is required", done);
    });

    it("Notification of missing suburb name error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("suburb", "Suburb is required", done);
    });

    it("Notification of missing first name error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("firstname", "First Name is required", done);
    });

    it("Notification of missing last name error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("lastname", "Last Name is required", done);
    });

    it("Notification of missing date of birth error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("dob", "Date of Birth is required", done);
    });

    it("Notification of missing address error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("address", "Address is required", done);
    });

    it("Notification of missing postcode error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("postcode", "Postcode is required", done);
    });

    it("Notification of missing phone error", function (done) {
        //1. setup & 2. exercise
        notifiesValidationErrors("phone", "Phone is required", done);
    });

    it("Notification of missing email error", function (done) {
        //1. setup - changing the default behaviour to be an invalid email
        incomingExpressRequest.body.email = '';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Email is required' }, { msg: 'Email does not appear to be valid' }], done);
    });

    it("Notification of invalid email error", function (done) {
        //1. setup - changing the default behaviour to be an invalid email
        incomingExpressRequest.body.email = '---';
        //2. exercise
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Email does not appear to be valid' }], done);
    });

    //3. Module Verify

    //4. Module Cleanup
    afterEach(function () {
        sandbox.restore();
    });
});