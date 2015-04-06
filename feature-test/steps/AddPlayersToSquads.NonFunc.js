/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var English = require('yadda').localisation.English;
var bulkloadhelpers = require('./BulkLoadHelpers');
var dbhelpers = require('./common/DbHelpers');
var testhelpers = require('./AddPlayerToSquadHelpers');
var _ = require('underscore');
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
    agelimitfieldname = 'agelimit',
    playersfieldname = 'players',
    playerfirstnamefieldname = 'firstname',
    playerlastnamefieldname = 'lastname',
    playerdobfieldname = 'dob',
    playeraddressfieldname = 'address',
    playersuburbfieldname = 'suburb',
    playerpostcodefieldname = 'postcode',
    playerphonefieldname = 'phone',
    playeremailfieldname = 'email';

/*
 * Will cycle through the testdata, extract the players and the squads they are destined for and then place them in random order so that
 * the writes look more like random user interactions
 */
function getPlayersFromTestDataRandomised(testdata) {
    var allplayers = _.shuffle(_.flatten(_.map(testdata, function (useritem) {

        var squadplayers = _.map(useritem.squads, function (squad) {

            var players = _.map(squad.players, function (player) {

                return {
                    squadname: squad.squadname,
                    firstname: player.firstname,
                    lastname: player.lastname,
                    dob: player.dob,
                    suburb: player.suburb,
                    postcode: player.postcode,
                    phone: player.phone,
                    email: player.email
                };

            });

            _.each(players, function (player) {
                player.season = useritem.season;
                player.clubname = useritem.clubname;
                player.cityname = useritem.cityname;
            });

            return players;

        });

        return squadplayers;
    })));
    return allplayers;
}

module.exports = (function () {

    return English.library()

        // Background
        .given("There will be several users as specified in our test user file $testdatafile with details of players for squads for a club.", function (testdatafile, next) {
            //1. Setup Test Data
            var interpreter_context = this.interpreter_context,
                testdata = require(testdatafile),
                createdClubs = interpreter_context.createdClubs,
                clubsDb = interpreter_context.clubsDb,
                blh = new bulkloadhelpers(),
                dbh = new dbhelpers(true);
            interpreter_context.testdata = testdata;
            blh.CreateUsers(interpreter_context.testdata, useremailfieldname, userfirstnamefieldname,
                userlastnamefieldname, userpasswordfieldname,
                interpreter_context.createdUsers, interpreter_context.usersDb,
                function () {
                    blh.CreateClubs(testdata, clubsDb, createdClubs,
                                clubnamefieldname, fieldnamefieldname, suburbnamefieldname,
                                citynamefieldname, useremailfieldname,
                        function () {
                            blh.CreateSquads(interpreter_context.testdata, dbh, interpreter_context.squadsDb, interpreter_context.createdSquads,
                                                 clubnamefieldname, citynamefieldname, seasonfieldname,
                                                 squadsfieldname, squadnamefieldname, agelimitfieldname, useremailfieldname,
                                                 interpreter_context.testdata.length, function () {
                                    interpreter_context.playersTargetSquad = getPlayersFromTestDataRandomised(interpreter_context.testdata);
                                    blh.CreatePlayers(interpreter_context.playersTargetSquad, dbh, interpreter_context.playersDb, interpreter_context.createdPlayers,
                                                                    playerfirstnamefieldname, playerlastnamefieldname, playerdobfieldname, playeraddressfieldname,
                                                                    playersuburbfieldname, playerpostcodefieldname, playerphonefieldname, playeremailfieldname, next);
                                });
                        });
                });
        })

        // Scenario 1
        .given("User chooses a player to add to a squad within a club", function (next) {
            next();
        })

        .when("saved", function (next) {
            var i,
                playersquad,
                playeremail,
                players = this.interpreter_context.playersTargetSquad,
                playerslength = players.length,
                currentarrayitem,
                ths = new testhelpers();
            for (i = 0; i < playerslength; i = i + 1) {
                currentarrayitem = players[i];
                playersquad = currentarrayitem.squadname;
                playeremail = currentarrayitem.email;
                ths.ExecuteAdditionOfPlayerToSquad(this.interpreter_context, currentarrayitem.clubname, currentarrayitem.cityname,
                    playersquad, currentarrayitem.season, playeremail, i, playerslength, next);
            }
        })

        .then("the player will be in the squad for the club as specified in the data file", function (next) {
            var i, j,
                clubname,
                cityname,
                squadname,
                season,
                testdata = this.interpreter_context.testdata,
                testdatalength = testdata.length,
                squads,
                squadslength,
                squad,
                players,
                currentarrayitem,
                ths = new testhelpers();
            for (i = 0; i < testdatalength; i = i + 1) {
                currentarrayitem = testdata[i];
                clubname = currentarrayitem[clubnamefieldname];
                cityname = currentarrayitem[citynamefieldname];
                season = currentarrayitem[seasonfieldname];
                squads = currentarrayitem[squadsfieldname];
                squadslength = squads.length;
                for (j = 0; j < squadslength; j = j + 1) {
                    squad = squads[j];
                    squadname = squad[squadnamefieldname];
                    players = squad[playersfieldname];
                    ths.AssertAdditionOfPlayersToSquad(this.interpreter_context.squadplayersDb, clubname, cityname, squadname, season, players, i, j, squadslength, testdatalength, next);
                }
            }
        });

}());
