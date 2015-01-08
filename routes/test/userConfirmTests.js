var user = require('../userConfirm');
var sinon = require('sinon');
var usermanagementservice = require('../../lib/UserManagementService');
var sinonChai = require("sinon-chai");
var chai = require("chai");
chai.should();
chai.use(sinonChai);
require('mocha-sinon');

describe("Testing of expressjs route for user confirmation: ", function() {

    var u;
    var sandbox;
    var stubConfirm;
    var umsResponse;
    var ums;
    var incomingExpressRequest;
    var outgoingExpressResponse;
    var outgoingExpressRenderSpy;

    before(function() {
    });
    
    beforeEach(function()  {
    
        ums = new usermanagementservice(null, null, null, null);
        incomingExpressRequest = { 
                    query: { u: 'rob@wk.com.au', t: 'UniqueTokenString'  }, 
                    session: { authenticated: false, user: null }
        };

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubConfirm = sandbox.stub(ums, 'ConfirmRegisterUser');
        umsResponse = { };
        stubConfirm.yields(null, umsResponse);
        outgoingExpressResponse = { 
            render: function(view) { }, 
        };
        outgoingExpressRenderSpy = sandbox.spy(outgoingExpressResponse, 'render');

        //this will be setup to be injected soon enough
        u = new user(ums);
    });

    afterEach(function()  {
        sandbox.restore();
    });

    it("Confirm a valid user", function(done) {
        //setup
        
        //exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertUserServiceConfirmed('login', outgoingExpressRenderSpy, 'alert-success', 'You have been successfully confirmed, please log in.');
        
        //teardown
        done();
    });

    it("Reject blank query parameter - u", function(done) {
        //setup
        incomingExpressRequest = { 
                    query: { t: 'UniqueTokenString'  }, 
                    session: { authenticated: false, user: null }
        };
        
        //exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertQueryParameterMissing('u');
        
        //teardown
        done();
    });

    it("Reject blank query parameter - t", function(done) {
        //setup
        incomingExpressRequest = { 
                    query: { u: 'rob@mu.co.uk'  }, 
                    session: { authenticated: false, user: null }
        };
        
        //exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertQueryParameterMissing('t');
        
        //teardown
        done();
    });

    it("Notifies via response when an error during confirmation service occurs", function(done) {
        //setup - changing the default behaviour
        var expectedErrorMessage = 'User Confirmation Service Failure';
        var expectedError = new Error(expectedErrorMessage);
        stubConfirm.yields(expectedError);

        //exercise
        u.get(incomingExpressRequest, outgoingExpressResponse);
        
        //verify
        assertUserServiceConfirmed('login', outgoingExpressRenderSpy, 'alert-danger', expectedErrorMessage);
        
        //teardown
        done();
    });

    it("Post is not allowed, so throw an error", function(done) {
        //setup
        
        //exercise
        try {
            u.post(incomingExpressRequest, outgoingExpressResponse);
        } catch(e) {
            //verify
            e.message.should.equal('Post is not permitted for confirmation');
        }
        
        //teardown
        done();
    });
    
    function assertUserServiceConfirmed(redirectView, spy, alertType, message) {
        spy.should.have.been.calledWith(redirectView, sinon.match({ flash: {
                        type: alertType,
                        messages: [{ msg: message }]
                    }    
                }));
    }
    
    function assertQueryParameterMissing(parameterName) {
        outgoingExpressRenderSpy.should.have.been.calledWith('login', sinon.match({ flash: {
                        type: 'alert-danger',
                        messages: [{ msg: 'Invalid confirmation url' }]
                    }    
                }));
    }
});