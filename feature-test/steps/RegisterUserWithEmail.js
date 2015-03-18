/*jslint node: true */
/*jslint newcap: true */
/*jslint plusplus: true */
/*global before, beforeEach, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
'use strict';

var assert = require('assert');
var _ = require('underscore');
var English = require('yadda').localisation.English;
var ums;

module.exports = (function () {

    return English.library()

        // Background
        .given("^We visit the register user page on the site.", function (next) {
            ums = this.interpreter_context.ums;
            next();
        })

        // Scenario 1
        .given("I choose to register with an email and a password", function (next) {
            next();
        })

        .when("I enter $email into the email field and $password in the password field and click the Register button", function (email, password, next) {
            var ictx = this.interpreter_context;
            ums.RegisterUser(email, password,
                function (err) {
                    assert.ifError(err, "Error in RegisterUser");
                    //created the user - will need to remove it later - so store here for the clean up to occur
                    ictx.createdUsers.push({
                        email: email,
                        password: password
                    });
                    next();
                });
        })

        .then("$firstname lastname will be sent a validation email.  No other details are required until the email is validated.", function (firstname, lastname, next) {
            console.log('Firstname %s and Lastname %s appear as part of the narrative and not used as such', firstname, lastname);
            assert(this.interpreter_context.evs.messageCount === 1, 'Expected one message to have been sent');
            next();
        })

        // Scenario 2
        .given("$firstname lastname is already registered on the website as $email", function (firstname, lastname, email, next) {
            console.log('Firstname %s and Lastname %s with email %s appear as part of the narrative and not used as such', firstname, lastname, email);
            //No need to set up here - the same user was registered in the previous step - Yadda will not execute out of order.  Using a Background possible, but found not quite 
            //right for this context
            next();
        })

        .when("$email is entered into the email field and $password in the password field and click the Register button", function (email, password, next) {
            var scenario_ctx = this.scenario_context;
            ums.RegisterUser(email, password,
                function (err) {
                    assert(err.message.length > 0, 'Should be expecting an error');
                    scenario_ctx.err = err;
                    next();
                });
        })

        .then("$firstname lastname will be told that she is already registered.  She should be told to use the login button on the home page to login", function (firstname, lastname, next) {
            console.log('Firstname %s and Lastname %s appear as part of the narrative and not used as such', firstname, lastname);
            assert.equal(this.scenario_context.err.message, 'User already exists', 'Expecting to be told that the user was already registered');
            next();
        });

}());
