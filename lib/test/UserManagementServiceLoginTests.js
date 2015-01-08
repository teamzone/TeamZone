/// <reference path='../../typings/tsd.d.ts' />
/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />
/// <reference path="../../typings/should/should.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../typings/bcrypt/bcrypt.d.ts" />
/// <reference path="../UserManagementService.ts" />
var assert = require('assert');
var levelcache = require('level-cache');
var sinon = require('sinon');
var bcrypt = require('bcrypt');
var emailverifyservice = require('../EmailVerifyService');
var createError = require('errno').create;
require('mocha-sinon');
require('../common/jsInject');
var usermanagementservice = require('../UserManagementService');

describe("User Management Service Login Unit Tests", function () {
    var levelimdb;
    var stubCompareCrypt;
    var ums;
    var spyCallback;
    var stubGet;
    var stubPut;
    var sandbox;
    var password;
    var errorNotFound;
    var evs;
    var expectedUserObject;
    var $jsInject;

    function injectDependenciesForUserManagementService() {
        //use in memory db, some calls are mocked anyway - but this makes it easier anyway
        levelimdb = levelcache();
        evs = new emailverifyservice();

        // ums = new usermanagementservice(levelimdb, bcrypt, token, evs);
        $jsInject = new $$jsInject();
        $jsInject.register("UserManagementService", ["users", "crypt", "tokenizer", "emailsender", usermanagementservice]);
        $jsInject.register("users", [function () {
                return levelimdb;
            }]);
        $jsInject.register("crypt", [function () {
                return bcrypt;
            }]);
        $jsInject.register("tokenizer", [function () {
                return null;
            }]);
        $jsInject.register("emailsender", [function () {
                return evs;
            }]);

        //methods to tests are here with required dependencies passed through construction
        ums = $jsInject.get("UserManagementService");
    }

    beforeEach(function () {
        //Setup that is used across all tests
        injectDependenciesForUserManagementService();

        //sandbox to cleanup global spies
        sandbox = sinon.sandbox.create();
        stubCompareCrypt = sandbox.stub(bcrypt, 'compare');
        spyCallback = sandbox.spy();
        stubGet = sandbox.stub(levelimdb, 'get');
        stubPut = sandbox.stub(levelimdb, 'put');

        // default mocked values for the tests.
        password = 'FergusonTheGreatest';
        expectedUserObject = { password: 'hashedPassword', firstname: 'John', surname: 'Ferguson', email: 'john@mu.co.uk', confirmed: true, loggedIn: true, token: null };
        stubGet.yields(null, expectedUserObject);
        stubCompareCrypt.yields(null, true);
        stubPut.yields();

        var NotFoundError = createError('NotFoundError');
        NotFoundError.prototype.notFound = true;
        errorNotFound = new NotFoundError();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should validate login credentials", function (done) {
        //1. Setup
        //2. Exercise
        ums.LoginUser(expectedUserObject.email, password, spyCallback);

        //3. Verify
        assertLoginWasValidatedSuccessfully();

        //4. Teardown
        //Nothing to tear down
        done();
    });

    it("An unconfirmed user should be prevented from logging in", function (done) {
        //1. Setup
        expectedUserObject.confirmed = false;

        //2. Exercise
        ums.LoginUser(expectedUserObject.email, password, spyCallback);

        //3. Verify
        assertWasErrorReturnedForUnconfirmedUser();

        //4. Teardown
        done();
    });

    it("Valid login should return a result in a populated user object", function (done) {
        //1. Setup
        //2. Exercise
        ums.LoginUser(expectedUserObject.email, password, spyCallback);

        //3. Verify
        assertLoginHasPopulatedTheUserObject();

        //4. Teardown
        done();
    });

    it("Should compare the password hash", function (done) {
        //1. Setup
        //2. Exercise
        ums.LoginUser(expectedUserObject.email, password, spyCallback);

        //3. Verify
        assertThePasswordIsCheckedAgainstTheHashedPassword();

        //4. Teardown
        done();
    });

    it("Should compare the password hash and notify of failure in the comparison", function (done) {
        //1. Setup
        stubCompareCrypt.yields(null, false);
        
        //2. Exercise
        ums.LoginUser(expectedUserObject.email, password + password, spyCallback);
        
        //3. Verify
        assertNotifyOfPasswordComparisonFailure();
  
        //4. Teardown
        done();
    });
    
    it("When the password hash compare fails the caller should be notified", function (done) {
        // etup
        var expectedHashError = new Error('Hash Failure');
        stubCompareCrypt.yields(expectedHashError, false);

        //2. Exercise
        ums.LoginUser(expectedUserObject.email, password, spyCallback);

        //3. Verify
        assertReturnErrorWhenThePasswordHashFailsForReasonsOtherThanQuality(expectedHashError);

        //4. Teardown
        done();
    });

    it("Given the user is not registered, should return an error", function (done) {
        // Setup
        stubGet.yields(errorNotFound, null);

        // Exercise
        ums.LoginUser(expectedUserObject.email, password, spyCallback);

        // Verify
        assertErrorReturnedWhenUserNotRegistered(errorNotFound);

        // Teardown
        // Nothing to teardown
        done();
    });

    function assertLoginWasValidatedSuccessfully() {
        assert(spyCallback.calledOnce, 'Callback not called');
        assert(spyCallback.calledWith(undefined), 'Not expecting an error');
    }

    function assertLoginHasPopulatedTheUserObject() {
        var result = spyCallback.args[0][1];
        assert.equal(expectedUserObject.firstname, result.firstname, "firstname does not match");
        assert.equal(expectedUserObject.surname, result.surname, "surname does not match");
        assert.equal(expectedUserObject.email, result.email, "email does not match ");
        assert(result.loggedIn, "Should be Logged In");
        assert(result.password === undefined, 'Should not have a password returned');
    }

    function assertErrorReturnedWhenUserNotRegistered(expectedError) {
        assert(spyCallback.calledWith(expectedError), 'Expecting error in callback');
    }

    function assertReturnsErrorWhenNewUserDoesNotGetSavedToTheDatabase(errormessage) {
        assert(callbackCalledWithError(errormessage), 'Failed to raise error message ' + errormessage);
    }

    function assertReturnsErrorOnGeneralDatabaseFailure(message) {
        assert(callbackCalledWithError(message), 'Error message not returned through callback');
    }

    function assertWasErrorReturnedForUnconfirmedUser() {
        assert(callbackCalledWithError('User has yet to be confirmed'), 'User should be confirmed prior to be allowed to log in');
    }

    function assertThePasswordIsCheckedAgainstTheHashedPassword() {
        assert(stubCompareCrypt.calledOnce, 'Hash was not compared');
    }

    function assertNotifyOfPasswordComparisonFailure() {
      assert(callbackCalledWithError('Incorrect Login Details Entered, please check your email and/or password'), 'Password Comparison failure');  
    }
    
    function assertReturnErrorWhenThePasswordHashFailsForReasonsOtherThanQuality(expectedHashError) {
        assert(spyCallback.calledWith(expectedHashError), 'Expecting error in callback');
    }

    function callbackCalledWithNoError() {
        return spyCallback.calledWith(sinon.match.falsy);
    }

    function callbackCalledWithError(optionalMessage) {
        var calledWithError = spyCallback.calledWith(sinon.match.instanceOf(Error));
        var messageMatches = !optionalMessage || spyCallback.calledWith(sinon.match.has("message", optionalMessage));
        return calledWithError && messageMatches;
    }
});
//# sourceMappingURL=UserManagementServiceLoginTests.js.map
