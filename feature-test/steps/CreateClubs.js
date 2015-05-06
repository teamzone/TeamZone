/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');

function createUser(dbh, usersDb, createdUsers, userfirstname, userlastname, userpassword, useremail, currentUserCount, testUserCount, next) {
    dbh.CreateUser(usersDb, createdUsers, userfirstname, userlastname, userpassword, useremail, '', true,
        function (err) {
            //force failure
            if (err) {
                assert.fail(err, undefined, "Error in Create User with error: " + err.message);
            }
            //need to wait for creation to complete before proceeding
            if (currentUserCount === testUserCount - 1) {
                console.log('user creation completed');
                next();
            }
        });
}

function createUsers(testdata, useremailfieldname, userfirstnamefieldname, userlastnamefieldname, userpasswordfieldname, createdUsers, usersDb, next) {
    var testdatalength = testdata.length,
        currentarrayitem,
        i,
        dbh = new dbhelpers();
    for (i = 0; i < testdatalength; i = i + 1) {
        currentarrayitem = testdata[i];
        createUser(dbh, usersDb, createdUsers, currentarrayitem[userfirstnamefieldname], currentarrayitem[userlastnamefieldname],
                   currentarrayitem[userpasswordfieldname], currentarrayitem[useremailfieldname], i, testdatalength, next);
    }
}

function createClub(cms, clubname, fieldname, suburbname, cityname, adminemail, createdClubs, currentClubCount, totalClubCount, next) {
    cms.CreateClub(clubname, fieldname, suburbname, cityname, adminemail,
        function (err) {
            if (err) {
                assert.fail(err, undefined, "Error in CreateClub with error: " + err.message);
            }
            //saving the created club for cleaning up later on
            createdClubs.push({ club: clubname, city: cityname });
            if (currentClubCount === totalClubCount - 1) {
                next();
            }
        });
}

function createClubs(testdata, cms, createdClubs, clubnamefieldname, fieldnamefieldname, suburbnamefieldname, citynamefieldname, useremailfieldname, next) {
    var testdatalength = testdata.length,
        i,
        currentarrayitem;
    for (i = 0; i < testdatalength; i = i + 1) {
        currentarrayitem = testdata[i];
        createClub(cms, currentarrayitem[clubnamefieldname], currentarrayitem[fieldnamefieldname], currentarrayitem[suburbnamefieldname],
            currentarrayitem[citynamefieldname], currentarrayitem[useremailfieldname], createdClubs, i, testdatalength, next);
    }
}

function checkClubCreated(dbh, clubsDb, clubname, cityname, suburbname, fieldname, adminemail, currentClubCount, totalClubCount, next) {
    dbh.GetClub(clubsDb, clubname, cityname, function (err, res) {
        if (err) {
            assert.fail(err, undefined, "Error in getting the club back with error: " + err.message);
        }
        assert.equal(res.admin, adminemail, 'admin email should have been set to ' + adminemail + ' instead it was ' + res.admin);
        assert.equal(res.suburb, suburbname, 'suburb should have been set to ' + suburbname + ' instead it was ' + res.suburb);
        assert.equal(res.field, fieldname, 'fieldname should have been set to ' + fieldname + ' instead it was ' + res.field);
        if (currentClubCount === totalClubCount - 1) {
            next();
        }
    });
}

module.exports = (function () {

    return English.library()

        // Background
        .given("There will be several users as specified in our test user file $testdatafile who are creating clubs. The user details are in fields $adminemail, $adminfirstname, $adminlastname, $adminpassword",
            function (testdatafile, useremailfieldname, userfirstnamefieldname, userlastnamefieldname, userpasswordfieldname, next) {
                this.interpreter_context.testdata = require(testdatafile);
                createUsers(this.interpreter_context.testdata, useremailfieldname, userfirstnamefieldname, userlastnamefieldname, userpasswordfieldname,
                            this.interpreter_context.createdUsers, this.interpreter_context.usersDb, next);
            })

        // Scenario 1
        .given("$useremailfieldname gives the club name $clubnamefieldname located at $fieldnamefieldname in the suburb of $suburbnamefieldname in the city of $citynamefieldname",
            function (useremailfieldname, clubnamefieldname, fieldnamefieldname, suburbnamefieldname, citynamefieldname, next) {
                this.interpreter_context.useremailfieldname = useremailfieldname;
                this.interpreter_context.clubnamefieldname = clubnamefieldname;
                this.interpreter_context.fieldnamefieldname = fieldnamefieldname;
                this.interpreter_context.suburbnamefieldname = suburbnamefieldname;
                this.interpreter_context.citynamefieldname = citynamefieldname;
                createClubs(this.interpreter_context.testdata, this.interpreter_context.cms, this.interpreter_context.createdClubs, clubnamefieldname, fieldnamefieldname, suburbnamefieldname,
                        citynamefieldname, useremailfieldname, next);
            })

        .when("the club is saved", function (next) {
            next();
        })

        .then("the adminemail will also be the administrator of the club", function (next) {
            var testdata = this.interpreter_context.testdata,
                i,
                testdatalength = testdata.length,
                dbh = new dbhelpers(),
                currentarrayitem;
            for (i = 0; i < testdatalength; i = i + 1) {
                currentarrayitem = testdata[i];
                checkClubCreated(dbh, this.interpreter_context.clubsDb, currentarrayitem[this.interpreter_context.clubnamefieldname],
                                currentarrayitem[this.interpreter_context.citynamefieldname], currentarrayitem[this.interpreter_context.suburbnamefieldname],
                                currentarrayitem[this.interpreter_context.fieldnamefieldname], currentarrayitem[this.interpreter_context.useremailfieldname],
                                i, testdatalength, next);
            }
        });
}());
