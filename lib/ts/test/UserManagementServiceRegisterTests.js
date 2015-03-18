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

describe("User Management Service Register User Unit Tests", function () {
    //1. Module Setup
    var levelimdb,
        stubCreateCrypt,
        ums,
        spyCallback,
        stubGet,
        stubPut,
        stubDelete,
        sandbox,
        password,
        errorNotFound,
        stubSendVerifyEmail,
        stubTokenGenerate,
        evs,
        tokenGenerated,
        expectedUserObject,
        $jsInject;

    function injectDependenciesForUserManagementService() {
        //use in memory db, some calls are mocked anyway - but this makes it easier anyway
        levelimdb = levelcache();
        evs = new emailverifyservice();

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

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubCreateCrypt = sandbox.stub(bcrypt, 'hash');
        spyCallback = sandbox.spy();
        stubGet = sandbox.stub(levelimdb, 'get');
        stubPut = sandbox.stub(levelimdb, 'put');
        stubDelete = sandbox.stub(levelimdb, 'del');
        stubSendVerifyEmail = sandbox.stub(evs, 'send');
        stubTokenGenerate = sandbox.stub(token, 'generate');

        // default mocked values for the tests.
        password = 'FergusonTheGreatest';
        expectedUserObject = { password: 'hashedPassword', firstname: 'john', surname: 'ferguson', email: 'john@mu.co.uk', confirmed: true, loggedIn: true, token: null};
        stubGet.yields(null, expectedUserObject);
        stubCreateCrypt.yields(null, expectedUserObject.password);
        stubPut.yields();
        stubDelete.yields();
        stubSendVerifyEmail.yields();
        tokenGenerated = 'A-token-to-send-to-the-registering-user';
        stubTokenGenerate.returns(tokenGenerated);

        var NotFoundError = createError('NotFoundError');
        NotFoundError.prototype.notFound = true;
        errorNotFound = new NotFoundError();
    });

    function callbackCalledWithNoError() {
        return spyCallback.calledWith(sinon.match.falsy);
    }

    function callbackCalledWithError(optionalMessage) {
        var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error)),
            messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
        return calledWithError && messageMatches;
    }

    function assertNewUserSuccessfullyRegistered() {
        assert(stubPut.calledWith(expectedUserObject.email, sinon.match({ password: expectedUserObject.password, email: expectedUserObject.email, token: tokenGenerated })), 'put not call with required user data');
        assert(callbackCalledWithNoError(), 'Callback not called after saving the user');
    }

    function assertReturnsErrorWhenUserAlreadyExists() {
        assert(callbackCalledWithError("User already exists"), 'Error message not returned through callback');
    }

    function assertReturnsErrorWhenNewUserDoesNotGetSavedToTheDatabase(errormessage) {
        assert(callbackCalledWithError(errormessage), 'Failed to raise error message ' + errormessage);
    }

    function assertReturnsErrorOnGeneralDatabaseFailure(message) {
        assert(callbackCalledWithError(message), 'Error message not returned through callback');
    }

    function assertReturnsErrorWhenTheHashOfthePasswordDoesntWork(error) {
        assert(callbackCalledWithError(error), 'Error message not returned through callback');
    }

    function assertWasTheHashCalledPriorToRegisteringTheUserInTheDatabase() {
        assert(stubCreateCrypt.calledWith(password, 10), 'Encryption not enacted with correct parameters');
        assert(stubPut.calledWith(expectedUserObject.email, sinon.match({ password: 'hashedPassword', email: expectedUserObject.email })), 'put not called with correct parameters');
        sinon.assert.callOrder(stubCreateCrypt, stubPut);
    }

    function assertWasTheTokenizerCalledPriorToRegisteringTheUserInTheDatabase() {
        assert(stubTokenGenerate.calledWith(expectedUserObject.email), 'Token not generated with email as parameter');
        assert(stubPut.calledWith(expectedUserObject.email, sinon.match({ password: 'hashedPassword', email: expectedUserObject.email })), 'put not called with correct parameters');
        sinon.assert.callOrder(stubTokenGenerate, stubPut);
    }

    function assertWasTheErrorFromTheTokenGeneratorHandled() {
        callbackCalledWithError('An error occured generating the unique user token');
    }

    function assertWasEmailSentAfterSaving() {
        stubSendVerifyEmail.calledWith(expectedUserObject.email, token, 'We did not get the expected call to the emailer');
        sinon.assert.callOrder(stubPut, stubSendVerifyEmail);
    }

    function assertErrorReturnedUserRolledBack() {
        assert(callbackCalledWithError('Failed to send the verification email and rolling back on the user failed as well.'), 'Rollback error was not returned');
    }

    function assertErrorReturnedOnEmailFailureUserRolledBack() {
        assert(stubDelete.calledWith(expectedUserObject.email), 'Expecting the new user to have been removed');
        assert(callbackCalledWithError('Failed to send the verification email'), 'Email error was not returned');
    }

    //2. Module Exercise

    it('Allows a new user to register', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertNewUserSuccessfullyRegistered();

        done();
    });

    it('Returns error if the registering user already exists', function (done) {
        // 1. Setup

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertReturnsErrorWhenUserAlreadyExists();

        done();
    });

    it('Enacts the hash of the password prior to saving to the database', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertWasTheHashCalledPriorToRegisteringTheUserInTheDatabase();

        done();
    });

    it('Enacts the tokenizer to generate a token that is used to verify the user prior to saving to the database', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertWasTheTokenizerCalledPriorToRegisteringTheUserInTheDatabase();

        done();
    });

    it('Notifies of an error when token generator fails', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        //stubTokenGenerate.restore();
        stubTokenGenerate.throws();

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertWasTheErrorFromTheTokenGeneratorHandled();

        //4. Cleanup
        done();
    });

    it('Sends the verification email upon successfully saving', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertWasEmailSentAfterSaving();

        //4. Cleanup  
        done();
    });

    it('Checking state (state based verification) of emailer after sending email', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        evs.send.restore();

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assert(evs.messageCount === 1);

        //4. Cleanup        
        done();
    });

    it('Checking state (behaviour based verification) of emailer after sending email', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        //clean up just for the test as we are using a mock
        stubSendVerifyEmail.restore();
        var mockSendVerifyEmail = sinon.mock(evs);
        mockSendVerifyEmail.expects('send').withArgs(expectedUserObject.email).once();

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email);

        // 3. Verify
        mockSendVerifyEmail.verify();

        //4. teardown
        mockSendVerifyEmail.restore();
        done();
    });

    it('Notifies of an error enacting emailing of verification email', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubSendVerifyEmail.yields(new Error('Email system failure'));

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertErrorReturnedOnEmailFailureUserRolledBack();

        //4. Cleanup  
        done();
    });

    it('Notifies of an error of the rollback of a user arising from failing to send the verification email', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        stubSendVerifyEmail.yields(new Error('Email system failure'));
        stubDelete.yields(new Error('Deletion Error'));

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertErrorReturnedUserRolledBack();

        //4. Cleanup  
        done();
    });

    it('Returns error upon hash failure', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);

        var hashError = 'Hash Error Occured';
        stubCreateCrypt.yields(new Error(hashError));

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertReturnsErrorWhenTheHashOfthePasswordDoesntWork(hashError);

        //4. Cleanup  
        done();
    });

    it('Returns error if checking for existance of the user fails because of db failure', function (done) {
        // 1. Setup
        var message = "General Database Failure";
        stubGet.yields(new Error(message));

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertReturnsErrorOnGeneralDatabaseFailure(message);

        //4. Cleanup  
        done();
    });

    it('Returns error if the registering user fails to be saved to the database', function (done) {
        // 1. Setup
        stubGet.yields(errorNotFound);
        var errormessage = "Database access failed";
        stubPut.yields(new Error(errormessage));

        // 2. Exercise
        ums.RegisterUser(expectedUserObject.email, password, spyCallback);

        // 3. Verify
        assertReturnsErrorWhenNewUserDoesNotGetSavedToTheDatabase(errormessage);

        //4. Cleanup
        done();
    });

    //3. Module Verify

    //4. Module Cleanup
    afterEach(function () {
        sandbox.restore();
    });

});