/*jslint node: true */
/*jslint newcap: true */
/*jslint plusplus: true */
/*global before, beforeEach, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
'use strict';

var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');
var ums;
var createdUsers;
var usersDb;

module.exports = (function () {

    return English.library()

        // Background
        .given("The user $firstname $lastname has already registered on TeamZone with email address $email.", function (firstname, lastname, email, next) {
            ums = this.interpreter_context.ums;
            createdUsers = this.interpreter_context.createdUsers;
            usersDb = this.interpreter_context.usersDb;
            // going direct to set up the user
            var dbh = new dbhelpers(),
                tokenHash = this.interpreter_context.token.generate(email);
            // Note: this is not checking for existence, therefore the prior records are overwritten
            dbh.CreateUser(usersDb, createdUsers, firstname, lastname, 'password not relevant', email, tokenHash, false, next);
        })

        // Scenario 1
        .given("that $firstname $lastname clicks on the link and open a browser to navigate to the link", function (firstname, lastname, next) {
            console.log('Firstname %s and Lastname %s appear as part of the narrative and not used as such', firstname, lastname);
            next();
        })

        .when("the browser sends the request to TeamZone", function (next) {
            next();
        })

        .then("$firstname $surname is confirmed as a real user", function (firstname, surname, next) {
            //simulating the browser sending the request into the API
            var token = createdUsers[createdUsers.length - 1].token,
                email = createdUsers[createdUsers.length - 1].email;
            ums.ConfirmRegisterUser(email, token, function (err) {
                assert.ifError(err, 'Error confirming the user ' + firstname + ' ' + surname);
                next();
            });
        })

        .then("should be notified in the browser that they have successfully registered", function (next) {
            //check the contents of the user in the database
            var dbh = new dbhelpers(),
                createdUser = createdUsers[createdUsers.length - 1];
            dbh.GetUser(usersDb, createdUser.email, function (err, value) {
                assert.ifError(err, 'Unable to check the confirmed user because of get failure');
                assert.equal(value.email, createdUser.email, 'email should still be available after confirming the user');
                assert(value.password !== null, 'Password should still be available after confirming the user');
                assert.equal(value.token, createdUser.token, 'token should still be available after confirming the user');
                assert(value.confirmed, 'user should be confirmed');
                next();
            });
        })

        // Scenario 2
        .given("$firstname $surname clicks on the link again and opens a browser to navigate to the link", function (firstname, lastname, next) {
            console.log('Firstname %s and Lastname %s appear as part of the narrative and not used as such', firstname, lastname);
            next();
        })

        .when("the browser sends the request to TeamZone again", function (next) {
            var token = createdUsers[createdUsers.length - 1].token,
                email = createdUsers[createdUsers.length - 1].email,
                scenario_context = this.scenario_context;
            ums.ConfirmRegisterUser(email, token, function (err) {
                assert.ifError(err, 'Not expecting an error');
                //now register again
                ums.ConfirmRegisterUser(email, token, function (err) {
                    assert(err.message.length > 0, 'Should be expecting an error');
                    scenario_context.err = err;
                    next();
                });
            });
        })

        .then('the request should be ignored', function (next) {
            next();
        })

        .then('$firstname $lastname should be notified that they have already registered and need not do that again', function (firstname, lastname, next) {
            var msg = this.scenario_context.err.message;
            assert(msg.indexOf('already registered') > 0, firstname + ' ' + lastname + ' should receive a message with at least containing `already registered`. Instead message was: %s' + msg);
            next();
        });
}());
