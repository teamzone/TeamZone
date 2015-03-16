/*jslint nomen: true */
/* global before, afterEach, after, describe, it */
'use strict';

var createsquad = require('../createSquad');
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

describe("Testing of expressjs route for create a squad", function() {

    var cs,
        sandbox,
        stubCreateClub,
        tmsResponse,
        tms,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy,
        requestValidator;
    
    before(function() {
    });
    
    beforeEach(function()  {
    
        tms = new teammanagementservice(null);
        incomingExpressRequest = { 
                    body: { clubname: 'Western Knights', cityname: 'Perth', squadname: '1st team', season: '2015', adminemail: 'mel.taylor-gainsford@wk.com.au', agelimit: 'unrestricted' }, 
                    session: { authenticated: true, user: { } }
        };
        requestValidator = expressValidator(incomingExpressRequest, {}, function() {
            console.log('Unit Test Stub - Validation performed');
        });
        
        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubCreateClub = sandbox.stub(tms, 'CreateSquad');
        stubCreateClub.yields(null);
        outgoingExpressResponse = { 
            redirect: function(view) { }, 
            render: function(view) { } 
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');

        //this will be setup to be injected soon enough
        cs = new createsquad(tms);
    });

    afterEach(function()  {
        sandbox.restore();
    });

    it("Create a valid squad", function(done) {
        //1. setup
        
        //2. exercise
        cs.post(incomingExpressRequest, outgoingExpressResponse);
        
        //3. verify
        assertSquadCreatedAndViewUpdated('manageSquad', outgoingExpressResponseSpy, 
            'alert-success', 
            [{ msg: 'Squad has been successfully created.' }]);
        
        //4. teardown
        done();
    });

    it("Notifies via response when an error during call to createSquad in service", function(done) {
        //setup - changing the default behaviour
        var expectedErrorMessage = 'Create Squad Service Failure';
        var expectedError = new Error(expectedErrorMessage);
        stubCreateClub.yields(expectedError);

        //exercise
        cs.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertSquadCreatedAndViewUpdated('createSquad', outgoingExpressResponseSpy, 'alert-danger', [{ msg: expectedErrorMessage }]);
        
        //teardown
        done();
    });

    it("Notification of missing club name error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.clubname = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Club name is required' }], done);
    });

    it("Notification of missing city name error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.cityname = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'City is required' }], done);
    });

    it("Notification of missing season error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.season = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Season is required' }], done);
    });

    it("Notification of missing age limit error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.agelimit = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Age limit is required' }], done);
    });

    it("Notification of missing admin email error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.adminemail = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Administrator/Custodian Email is required' }, {msg: 'Administrator/Custodian Email does not appear to be valid'}], done);
    });

    it("Notification of invalid admin email error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.adminemail = '---';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Administrator/Custodian Email does not appear to be valid' }], done);
    });

    function assertSquadCreatedAndViewUpdated(redirectView, spy, alertType, messages) {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
                        type: alertType,
                        messages: messages
                    }    
                }));
    }

    function enactRequestBodyValidationTest(incomingExpressRequest, expectedMessage, done) {
        //exercise
        cs.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertSquadCreatedAndViewUpdated('createSquad', outgoingExpressResponseSpy, 'alert-danger', expectedMessage);
        
        //teardown
        done();
    }
    
});