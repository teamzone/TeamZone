var user = require('../user');
var sinon = require('sinon');
var assert = require('assert');
var usermanagementservice = require('../../lib/UserManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');

describe("Testing of expressjs routes for UI function for user services like login and register", function() {

    var u;
    var sandbox;
    var stubLogin;
    var umsResponse;
    var ums;
    var incomingExpressRequest;
    var outgoingExpressResponse;
    var outgoingExpressResponseSpy;
    
    before(function() {
    });
    
    beforeEach(function()  {
    
        ums = new usermanagementservice(null, null, null, null);
        
        incomingExpressRequest = { body: { username: 'rob', password: 'AussieInternational' }, session: { authenticated: false, user: null }};
      
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
      
        //setup
        
        //exercise
        u.post(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertLoginVerifiedAndViewUpdated(true, outgoingExpressResponseSpy, 'dashboard');
        
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
        assertLoginVerifiedAndViewUpdated(false, outgoingExpressResponseSpy, 'login', 'Login failed.  You may need to still verify your account or incorrect username/password was entered', 'alert-info');

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
        assertLoginVerifiedAndViewUpdated(false, outgoingExpressResponseSpy, 'login', expectedErrorMessage, 'alert-danger');

        //teardown
      
        done();    
    });
    
    function assertLoginVerifiedAndViewUpdated(loggedIn, spy, redirectView, message, alertType)
    {
        expect(incomingExpressRequest.session.authenticated).to.equal(loggedIn);
        if (message)
            assert(spy.should.have.been.calledWith(redirectView, 
                sinon.match({ flash: {
                        type: alertType,
                        messages: [{ msg: message }]
                    }    
                })),
                'Should have been redirected to ' + redirectView + ' with message ' + message + ' and alert-type ' + alertType);
        else
            assert(spy.should.have.been.calledWith(redirectView), 'Should have been redirected to ' + redirectView);
    }
    
});