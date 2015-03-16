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

describe("Testing of expressjs route for user register", function() {

    var u,
        sandbox,
        stubRegister,
        umsResponse,
        ums,
        incomingExpressRequest,
        outgoingExpressResponse,
        outgoingExpressResponseSpy,
        requestValidator;
    
    before(function() {
    });
    
    beforeEach(function()  {
    
        ums = new usermanagementservice(null, null, null, null);
        incomingExpressRequest = { 
                    body: { email: 'rob@wk.com.au', password: 'AussieInternational' }, 
                    session: { authenticated: false, user: null }
        };
        requestValidator = expressValidator(incomingExpressRequest, {}, function() {
            console.log('Unit Test Stub - Validation performed');
        });
        
        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubRegister = sandbox.stub(ums, 'RegisterUser');
        umsResponse = { };
        stubRegister.yields(null, umsResponse);
        outgoingExpressResponse = { 
            redirect: function(view) { }, 
            render: function(view) { } 
        };
        outgoingExpressResponseSpy = sandbox.spy(outgoingExpressResponse, 'render');

        //this will be setup to be injected soon enough
        u = new user(ums);
    });

    afterEach(function()  {
        sandbox.restore();
    });

    it("Registers a valid user", function(done) {
        //setup
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        //verify
        assertRegisterVerifiedAndViewUpdated('login', outgoingExpressResponseSpy, 'alert-success', [{ msg: 'Please check your email to verify your registration. Then you will be ready to log in!' }]);
        //teardown
        done();
    });

    it("Notifies via response when an error during registration service occurs", function(done) {
        //setup - changing the default behaviour
        var expectedErrorMessage = 'User Registration Service Failure';
        var expectedError = new Error(expectedErrorMessage);
        stubRegister.yields(expectedError);

        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertRegisterVerifiedAndViewUpdated('register', outgoingExpressResponseSpy, 'alert-danger', [{ msg: expectedErrorMessage }]);
        
        //teardown
        done();
    });

    it("Notification of missing password error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.password = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Password is required' }, { msg: 'Password length needs to be at least 8 characters' }], done);
    });

    it("Notification of password being too short error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.password = '12';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Password length needs to be at least 8 characters' }], done);
    });

    it("Notification of missing email error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.email = '';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Email is required' }, {msg: 'Email does not appear to be valid'}], done);
    });

    it("Notification of invalid email error", function(done) {
        //setup - changing the default behaviour
        incomingExpressRequest.body.email = '---';
        enactRequestBodyValidationTest(incomingExpressRequest, [{ msg: 'Email does not appear to be valid' }], done);
    });

    function enactRequestBodyValidationTest(incomingExpressRequest, expectedMessage, done) {
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertRegisterVerifiedAndViewUpdated('register', outgoingExpressResponseSpy, 'alert-danger', expectedMessage);
        
        //teardown
        done();
    }
    
    function assertRegisterVerifiedAndViewUpdated(redirectView, spy, alertType, messages)
    {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
                        type: alertType,
                        messages: messages
                    }    
                }));
    }
    
});