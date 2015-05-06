/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var dbhelpers = require('./common/DbHelpers');
var assert = require('assert');

function BulkLoadHelpers() {

    this.CreateUser = function (dbh, usersDb, createdUsers, userfirstname, userlastname, userpassword, useremail, currentUserCount, testUserCount, next) {
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
    };

    this.CreateUsers = function (testdata, useremailfieldname, userfirstnamefieldname, userlastnamefieldname, userpasswordfieldname, createdUsers, usersDb, next) {
        var testdatalength = testdata.length,
            i,
            currentarrayitem,
            dbh = new dbhelpers();
        for (i = 0; i < testdatalength; i = i + 1) {
            currentarrayitem = testdata[i];
            this.CreateUser(dbh, usersDb, createdUsers, currentarrayitem[userfirstnamefieldname], currentarrayitem[userlastnamefieldname],
                       currentarrayitem[userpasswordfieldname], currentarrayitem[useremailfieldname], i, testdatalength, next);
        }
    };

    this.CreateClub = function (dbh, clubsDb, clubname, fieldname, suburbname, cityname, adminemail, createdClubs, currentClubCount, totalClubCount, next) {
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
    };

    this.CreateClubs = function (testdata, clubsDb, createdClubs, clubnamefieldname, fieldnamefieldname, suburbnamefieldname, citynamefieldname, useremailfieldname, next) {
        var testdatalength = testdata.length,
            i,
            dbh = new dbhelpers(),
            currentarrayitem;
        for (i = 0; i < testdatalength; i = i + 1) {
            currentarrayitem = testdata[i];
            this.CreateClub(dbh, clubsDb, currentarrayitem[clubnamefieldname], currentarrayitem[fieldnamefieldname], currentarrayitem[suburbnamefieldname],
                currentarrayitem[citynamefieldname], currentarrayitem[useremailfieldname], createdClubs, i, testdatalength, next);
        }
    };

    this.CreateSquad = function (dbh, squadsdb, clubname, cityname, season, squadname, agelimit, creatinguser, createdSquads, currentClubCount, currentSquadInClubCount, totalClubCount, totalSquadsInClubCount, next) {
        dbh.CreateSquad(squadsdb, createdSquads, clubname, cityname, squadname, season, agelimit, creatinguser,
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
    };

    this.CreateSquads = function (testdata, dbh, squadsdb, createdSquads, clubnamefieldname, citynamefieldname, seasonfieldname,
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
                this.CreateSquad(dbh, squadsdb, clubname, cityname, season, squadname, agelimit, creatinguser, createdSquads, i, j, totalClubCount, squadslength, next);
            }
        }
    };

    this.CreatePlayer = function (dbh, playersdb, createdPlayers, clubname, cityname, playerfirstname, playerlastname, playerdob, playeremail,
        playeraddress, playersuburb, playerpostcode, playerphone, currentItemCount, totalItemCount, next) {
        dbh.CreatePlayer(playersdb, createdPlayers, playeremail, clubname, cityname, playerfirstname, playerlastname, playerdob, playeraddress, playersuburb, playerpostcode, playerphone,
            function () {
                if (currentItemCount === totalItemCount - 1) {
                    //all done -- continue on
                    next();
                }
            }, true);
    };

    this.CreatePlayers = function (testdata, dbh, playersdb, createdPlayers, clubnamefieldname, citynamefieldname, firstnamefieldname, lastnamefieldname, dobfieldname, addressfieldname,
                                   suburbfieldname, postcodefieldname, phonefieldname, emailfieldname, next) {
        var testdatalength = testdata.length,
            currentarrayitem,
            i;
        for (i = 0; i < testdatalength; i = i + 1) {
            currentarrayitem = testdata[i];
            this.CreatePlayer(dbh, playersdb, createdPlayers, currentarrayitem[clubnamefieldname], currentarrayitem[citynamefieldname], 
                currentarrayitem[firstnamefieldname], currentarrayitem[lastnamefieldname],
                currentarrayitem[dobfieldname], currentarrayitem[emailfieldname], currentarrayitem[addressfieldname],
                currentarrayitem[suburbfieldname], currentarrayitem[postcodefieldname],
                currentarrayitem[phonefieldname], i, testdatalength, next);
        }
    };

}

module.exports = BulkLoadHelpers;