/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var assert = require('assert');
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');
var useremailfieldname = 'adminemail',
    userfirstnamefieldname = 'adminfirstname',
    userlastnamefieldname = 'adminlastname',
    userpasswordfieldname = 'adminpassword',
    clubnamefieldname = 'clubname',
    fieldnamefieldname = 'fieldname',
    suburbnamefieldname = 'suburbname',
    citynamefieldname = 'cityname',
    squadsfieldname = 'squads',
    squadnamefieldname = 'squadname',
    seasonfieldname = 'season',
    agelimitfieldname = 'agelimit';

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
        i,
        currentarrayitem,
        dbh = new dbhelpers();
    for (i = 0; i < testdatalength; i = i + 1) {
        currentarrayitem = testdata[i];
        createUser(dbh, usersDb, createdUsers, currentarrayitem[userfirstnamefieldname], currentarrayitem[userlastnamefieldname],
                   currentarrayitem[userpasswordfieldname], currentarrayitem[useremailfieldname], i, testdatalength, next);
    }
}

function createClub(dbh, clubsDb, clubname, fieldname, suburbname, cityname, adminemail, createdClubs, currentClubCount, totalClubCount, next) {
    dbh.CreateClub(clubsDb, createdClubs, clubname, cityname, fieldname, suburbname, adminemail,
        function (err) {
            if (err) {
                assert.fail(err, undefined, "Error in CreateClub with error: " + err.message);
            }
            if (currentClubCount === totalClubCount - 1) {
                console.log('club creation completed');
                next();
            }
        });
}

function createClubs(testdata, clubsDb, createdClubs, clubnamefieldname, fieldnamefieldname, suburbnamefieldname, citynamefieldname, useremailfieldname, next) {
    var testdatalength = testdata.length,
        i,
        dbh = new dbhelpers(),
        currentarrayitem;
    for (i = 0; i < testdatalength; i = i + 1) {
        currentarrayitem = testdata[i];
        createClub(dbh, clubsDb, currentarrayitem[clubnamefieldname], currentarrayitem[fieldnamefieldname], currentarrayitem[suburbnamefieldname],
            currentarrayitem[citynamefieldname], currentarrayitem[useremailfieldname], createdClubs, i, testdatalength, next);
    }
}

function createSquad(tms, clubname, cityname, season, squadname, agelimit, creatinguser, createdSquads, currentClubCount, currentSquadInClubCount, totalClubCount, totalSquadsInClubCount, next) {
    tms.CreateSquad(clubname, cityname, squadname, season, agelimit, creatinguser,
        function (err) {
            if (err) {
                assert.fail(err, undefined, "Error in creating the squad back with error: " + err.message);
            }
            //saving the created club for cleaning up later on
            createdSquads.push({ club: clubname, city: cityname, squad: squadname, season: season });
            if ((currentClubCount === totalClubCount - 1) && (currentSquadInClubCount === totalSquadsInClubCount - 1)) {
                // finally done - move on
                next();
            }
        });
}

function createSquads(testdata, tms, createdSquads, clubnamefieldname, citynamefieldname, seasonfieldname,
                      squadsfieldname, squadnamefieldname, agelimitfieldname, useremailfieldname, totalClubCount, next) {
    var testdatalength = testdata.length,
        currentarrayitem,
        clubname,
        cityname,
        season,
        squadname,
        agelimit,
        squads,
        squadslength,
        creatinguser,
        i,
        j;
    for (i = 0; i < testdatalength; i = i + 1) {
        currentarrayitem = testdata[i];
        clubname = currentarrayitem[clubnamefieldname];
        cityname = currentarrayitem[citynamefieldname];
        season = currentarrayitem[seasonfieldname];
        creatinguser = currentarrayitem[useremailfieldname];
        squads = currentarrayitem[squadsfieldname];
        squadslength = squads.length;
        for (j = 0; j < squadslength; j = j + 1) {
            squadname = squads[j][squadnamefieldname];
            agelimit = squads[j][agelimitfieldname];
            createSquad(tms, clubname, cityname, season, squadname, agelimit, creatinguser, createdSquads, i, j, totalClubCount, squadslength, next);
        }
    }
}

function checkUserIsSquadCreator(dbh, squadsDb, clubname, cityname, squadname, season, agelimit, adminemail, currentSquadCount, totalSquadCount, next) {
    dbh.GetSquad(squadsDb, clubname, cityname, squadname, season, function (err, res) {
        if (err) {
            assert.fail(err, undefined, "Error in getting the squad back with error: " + err.message +
                " Check the keys (clubname, cityname, squadname, season) = (" + clubname + ', ' + cityname + ', ' + squadname + ', ' + season + ')');
        }
        assert.equal(res.admin, adminemail, 'admin email should have been set to ' + adminemail + ' instead it was ' + res.admin);
        assert.equal(res.agelimit, agelimit, 'agelimit should have been set to ' + agelimit + ' instead it was ' + res.agelimit);
        if (currentSquadCount === totalSquadCount - 1) {
            //finally done - move on
            next();
        }
    });
}

module.exports = (function () {

    return English.library()

        // Background
        .given("There will be several users as specified in our test user file $testdatafile with details of squads for a club.", function (testdatafile, next) {
            //1. Setup Test Data
            var testdata = require(testdatafile),
                createdClubs = this.interpreter_context.createdClubs,
                clubsDb = this.interpreter_context.clubsDb;
            this.interpreter_context.testdata = testdata;
            createUsers(this.interpreter_context.testdata, useremailfieldname, userfirstnamefieldname,
                userlastnamefieldname, userpasswordfieldname,
                this.interpreter_context.createdUsers, this.interpreter_context.usersDb,
                function () {
                    createClubs(testdata, clubsDb, createdClubs,
                                clubnamefieldname, fieldnamefieldname, suburbnamefieldname,
                                citynamefieldname, useremailfieldname, next);
                });
        })

        // Scenario 1
        .given("User gives the squad a name of squadname and an age limit of agelimit for the season season", function (next) {
            // we aren't going to use field names in the feature text - they are there just to give narrative context - we needed have even bothered
            // with the parsing as well

            // 2. Exercise
            createSquads(this.interpreter_context.testdata, this.interpreter_context.tms, this.interpreter_context.createdSquads,
                         clubnamefieldname, citynamefieldname, seasonfieldname,
                         squadsfieldname, squadnamefieldname, agelimitfieldname, useremailfieldname,
                         this.interpreter_context.testdata.length, next);
        })

        .when("the squad is saved", function (next) {
            next();
        })

        .then("the user will also be marked as the creator of the squad", function (next) {

            // 3. Verify

            var testdata = this.interpreter_context.testdata,
                testdatalength = testdata.length,
                dbh = new dbhelpers(),
                i,
                j,
                squadslength,
                currentclubitem,
                currentsquaditem,
                club,
                city,
                season,
                adminemail,
                totalSquads = this.interpreter_context.createdSquads.length,
                totalCheckedSquads = 0;
            for (i = 0; i < testdatalength; i = i + 1) {
                currentclubitem = testdata[i];
                club = currentclubitem[clubnamefieldname];
                city = currentclubitem[citynamefieldname];
                season = currentclubitem[seasonfieldname];
                adminemail = currentclubitem[useremailfieldname];
                squadslength = currentclubitem[squadsfieldname].length;
                for (j = 0; j < squadslength; j = j + 1) {
                    totalCheckedSquads = totalCheckedSquads + 1;
                    currentsquaditem = currentclubitem[squadsfieldname][j];
                    checkUserIsSquadCreator(dbh, this.interpreter_context.squadsDb, club, city, currentsquaditem[squadnamefieldname], season,
                                    currentsquaditem[agelimitfieldname], adminemail, totalCheckedSquads, totalSquads, next);
                }
            }
        });
}());