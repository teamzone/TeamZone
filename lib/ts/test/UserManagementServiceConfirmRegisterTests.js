/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var assert = require('assert'); // built-in node lib
var levelcache = require('level-cache');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var emailverifyservice = require('../EmailVerifyService');
var createError = require('errno').create;
require('mocha-sinon');
require('../../common/jsInject');
var token = require('token');
var usermanagementservice = require('../UserManagementService');

describe("User Management Service Confirm Registered User Unit Tests", function () {
    //1. Module Setup
    var levelimdb,
        ums,
        spyCallback,
        stubGet,
        stubPut,
        sandbox,
        errorNotFound,
        stubTokenVerify,
        expectedUserObject,
        $jsInject;

    function injectDependenciesForUserManagementService() {
        //use in memory db, some calls are mocked anyway - but this makes it easier anyway
        levelimdb = levelcache();
        var evs = new emailverifyservice();

        $jsInject = new $$jsInject();
        $jsInject.register("UserManagementService", ["users", "crypt", "tokenizer", "emailsender", usermanagementservice]);
        $jsInject.register("users", [function () { return levelimdb; }]);
        $jsInject.register("crypt", [function () { return bcrypt; }]);
        $jsInject.register("tokenizer", [function () { return token; }]);
        $jsInject.register("emailsender", [function () { return evs; }]);

        //methods to tests are here with required dependencies passed through construction
        ums = $jsInject.get("UserManagementService");
    }

    beforeEach(function () {

        //Setup that is used across all tests
        injectDependenciesForUserManagementService();

        //sandbox to cleanup global spies - test runner doesn't create new instance variables!
        sandbox = sinon.sandbox.create();
        spyCallback = sandbox.spy();
        stubGet = sandbox.stub(levelimdb, 'get');
        stubPut = sandbox.stub(levelimdb, 'put');
        stubTokenVerify = sandbox.stub(token, 'verify');

        // default mocked values for the tests.
        expectedUserObject = { password: 'hashedPassword', firstname: 'John', surname: 'Ferguson', email: 'john@mu.co.uk', confirmed: false, loggedIn: false, token: 'A token generated when the user registered - it will have a expiration as well'};
        stubGet.yields(null, expectedUserObject);
        stubPut.yields();
        stubTokenVerify.returns(true);

        var NotFoundError = createError('NotFoundError');
        NotFoundError.prototype.notFound = true;
        errorNotFound = new NotFoundError();
    });

    function callbackCalledWithError(optionalMessage) {
        var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error)),
            messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
        return calledWithError && messageMatches;
    }

    function assertReturnsErrorOnSaveForRegisteredUser(message) {
        assert(callbackCalledWithError(message), 'Error message not returned through callback.  Expected message is ' + message);
    }

    function assertReturnsErrorOnGetForRegisteredUser(message) {
        assert(callbackCalledWithError(message), 'Error message not returned through callback.  Expected message is ' + message);
    }

    function assertRegisteredUserIsConfirmed(user, password, email, tokenValue) {
        assert(stubTokenVerify.calledWith(user, tokenValue), 'Token verifier was not enacted for user ' + user + ' and token ' + tokenValue);
        assert(stubPut.calledWith(user, sinon.match({ password: password, email: email, token: tokenValue, confirmed: true })), 'put not called with user data with confirmation flagg');
        sinon.assert.callOrder(stubTokenVerify, stubPut);
    }

    function assertRegisteredUserIsAlreadyConfirmed(user) {
        assert(callbackCalledWithError(user + ' is already registered. Please login to access to the site.'), 'Check for confirmation did not occur');
    }

    function assertReturnsErrorOnTokenComparisonFailure() {
        assert(callbackCalledWithError('Confirmation token has failed validation. It may have been modified.'), 'Token Comparison Failure notification did not occur');
    }

    function assertReturnsErrorOnTokenComparisonError() {
        assert(callbackCalledWithError('Confirmation token has failed validation. Appears an error occurred.'), 'Token Comparison Error notification did not occur');
    }

    function assertReturnsErrorOnStoredTokenComparisonFailure() {
        assert(callbackCalledWithError('Confirmation token has failed validation. It has changed from the stored value.'), 'Token Comparison Error notification did not occur');
    }

    //2. Module Exercise

    it('Allows confirmation of a new user', function (done) {
        // 1. Setup

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, expectedUserObject.token, spyCallback);

        //3. Verify
        assertRegisteredUserIsConfirmed(expectedUserObject.email, expectedUserObject.password, expectedUserObject.email, expectedUserObject.token);

        //4. Teardown
        done();
    });

    it('Notifies when the user has already been confirmed', function (done) {
        // 1. Setup
        expectedUserObject.confirmed = true;

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, expectedUserObject.token, spyCallback);
        ums.ConfirmRegisterUser(expectedUserObject.email, expectedUserObject.token, spyCallback);

        //3. Verify
        assertRegisteredUserIsAlreadyConfirmed(expectedUserObject.email);
        done();
    });

    it('Notifies when then comparison with a stored token and passed in token fails', function (done) {
        //1. Setup

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, expectedUserObject.token + expectedUserObject.token, spyCallback);

        //3. Verify
        assertReturnsErrorOnStoredTokenComparisonFailure();

        //4. Teardown
        done();
    });

    it('Returns error when user no longer exists prior to confirming', function (done) {

        // 1. Setup
        stubGet.yields(errorNotFound);

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);

        //3. Verify
        assertReturnsErrorOnGetForRegisteredUser('The user ' + expectedUserObject.email + ' is not present in the database');

        //4. Teardown
        done();
    });

    it('Returns error token when unique token comparison returns false', function (done) {

        // 1. Setup
        stubTokenVerify.returns(false);

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);

        //3. Verify
        assertReturnsErrorOnTokenComparisonFailure();

        //4. Teardown
        done();
    });

    it('Returns error when unique token comparison throws error', function (done) {

        // 1. Setup
        stubTokenVerify.throws();

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);

        //3. Verify
        assertReturnsErrorOnTokenComparisonError();

        //4. Teardown
        done();
    });

    it('Returns error on a general get failure prior to confirming', function (done) {

        // 1. Setup
        var message = "General Database Failure";
        stubGet.yields(new Error(message));

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, 'not relevant', spyCallback);

        //3. Verify
        assertReturnsErrorOnGetForRegisteredUser('A failure occurred trying to retrieve details for ' + expectedUserObject.email);

        //4. Teardown
        done();
    });

    it('Returns error on when saving the confirmed user fails', function (done) {

        // 1. Setup
        var errormessage = "Database access failed";
        stubPut.yields(new Error(errormessage));

        // 2. Exercise
        ums.ConfirmRegisterUser(expectedUserObject.email, expectedUserObject.token, spyCallback);

        //3. Verify
        assertReturnsErrorOnSaveForRegisteredUser('A failure occurred trying to save confirmation for ' + expectedUserObject.email);

        //4. Teardown
        done();
    });

    //3. Module Verify

    //4. Module Teardown
    afterEach(function () {
        sandbox.restore();
    });
});