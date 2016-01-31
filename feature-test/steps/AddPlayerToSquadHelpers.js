/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

// var console = {};
// console.log = function(){};

var assert = require('assert');
var _ = require("underscore");
var dbhelpers = require('./common/DbHelpers');

function AddPlayerToSquadHelpers() {

    /*
    * Helps with the creation of test players enabling the test outcomes to be achieved
    * @param {string} interpreter_context - whole of test object bag holding key data
    * @param {string} playerfirstname - the first name of the player to create
    * @param {string} playerlastname - the last name of the player to create
    * @param {string} playerdob - the date of birth of the player to create
    * @param {string} playeremail - the email address of the player to create
    * @param {string} playeraddress - the residential address to give the player
    * @param {string} playersuburb - the residential suburb for the player
    * @param {string} playerpostcode - the residential postcode for the player
    * @param {string} playerphone - a personal or contact phone number for the player
    * @param {callback} next - continuation callback 
    */
    this.CreatePlayersForTheTest = function (interpreter_context, club, city, playerfirstname, playerlastname,
        playerdob, playeremail, playeraddress, playersuburb, playerpostcode, playerphone, next) {
        //these players need to be added as players to the db for the next part of the test to work
        var playersDb = interpreter_context.playersDb,
            createdPlayers = interpreter_context.createdPlayers,
            dbh = new dbhelpers(true);
        dbh.CreatePlayer(playersDb, createdPlayers, playeremail, club, city, playerfirstname,
                         playerlastname, playerdob, playeraddress, playersuburb,
                         playerpostcode, playerphone, next, true);
    };

    this.SetupBackgroundForAddPlayerToSquad = function (interpreter_context, coachfirstname, coachlastname, club, city, squad1, squad2, season, next) {
        interpreter_context.clubname = club;
        interpreter_context.cityname = city;
        interpreter_context.squadname1 = squad1;
        interpreter_context.squadname2 = squad2;
        interpreter_context.season = season;
        // create the sample user, making up the password and email address as being declarative in the feature makes it a bit easier to manage. Email is the key
        interpreter_context.coachemail = coachfirstname + '.' + coachlastname + '@gmail.com';
        // create the sample club name, some fields can be made up as they aren't material to the test
        var dbh = new dbhelpers(true);
        dbh.CreateClub(interpreter_context.clubsDb, interpreter_context.createdClubs, club, city, 'Burswood Oval', 'Burswood', 'admin@gmail.com', next, false);
        dbh.CreateSquad(interpreter_context.squadsDb, interpreter_context.createdSquads, club, city, squad1, season, 'over 16', interpreter_context.coachemail, next, false);
        dbh.CreateSquad(interpreter_context.squadsDb, interpreter_context.createdSquads, club, city, squad2, season, 'over 16', interpreter_context.coachemail, next, false);
        dbh.CreateUser(interpreter_context.usersDb, interpreter_context.createdUsers, coachfirstname, coachlastname, 'SomePassword', interpreter_context.coachemail, '', true, next);
    };

    this.ExecuteAdditionOfPlayerToSquad = function (interpreter_context, clubname, cityname, squadname, season, playerToAddEmail, currentItemCount, totalItemCount, next) {
        var createdSquadPlayers = interpreter_context.createdSquadPlayers,
            targetyear = Number(season.replace('Season ', ''));
        interpreter_context.sms.AddPlayerToSquad(clubname, cityname, squadname, season, playerToAddEmail, function (err) {
            if (err) {
                assert.fail(err, undefined, "Failed because of error in AddPlayerToSquad:  " + err.message + ' Player: ' + playerToAddEmail);
            }
            createdSquadPlayers.push({
                club: clubname,
                city: cityname,
                squad: squadname,
                season: season,
                email: playerToAddEmail
            });
            console.log('Successfully added the player %s to the squad %s', playerToAddEmail, squadname);
            if (currentItemCount === totalItemCount - 1) {
                //all done -- continue on
                next();
            }
        }, targetyear);
    };

    this.AssertAdditionOfPlayerToSquad = function (squadPlayersDb, clubname, cityname, squadname, season, playerfirstname, playerlastname, playeremail, next) {
        var dbh = new dbhelpers();
        dbh.GetSquadPlayer(squadPlayersDb, clubname, cityname, squadname, season, playeremail, function (err, player) {
            if (err) {
                assert.fail(err, undefined, 'Failure to get squad player for squad ' + squadname + ' in season ' + season + ' for player ' + playeremail + ' because of error: ' + err.message);
            }
            assert.equal(player.playeremail, playeremail, 'Exoected to receive the player email ' + playeremail + 'for key combination ('
                + clubname + ', ' + cityname + ', ' + squadname + ', ' + season + ') for player ' + playerfirstname + ' ' + playerlastname);
            next();
        });
    };

    function assertPlayer(expectedPlayer, players, currentPlayerCount, currentSquadCount, currentItemCount, playersCount, totalSquadCount, totalItemCount, next) {
        assert(_.find(players, function (p) { return p.value.playeremail === expectedPlayer.email; }), expectedPlayer.firstname + '.' +  expectedPlayer.lastname + ' ' + expectedPlayer.email + ' not found in Squad Players');
        if (currentPlayerCount === playersCount - 1 && currentSquadCount === totalSquadCount - 1 && currentItemCount === totalItemCount - 1) {
            //all done -- continue on
            next();
        }
    }

    this.AssertAdditionOfPlayersToSquad = function (squadPlayersDb, clubname, cityname, squadname, season, expectedPlayers, currentSquadCount, currentItemCount, totalSquadCount, totalItemCount, next) {
        var i,
            expectedPlayersCount = expectedPlayers.length,
            expectedPlayer,
            dbh = new dbhelpers();
        dbh.GetSquadPlayers(squadPlayersDb, clubname, cityname, squadname, season, function (err, players) {
            if (err) {
                assert.fail(err, undefined, 'Failure to get squad players for squad ' + squadname + ' in season ' + season + ' because of error: ' + err.message);
            }
            assert.equal(players.length, expectedPlayersCount, 'Wrong number of players for ' + squadname + ' Expected ' + expectedPlayersCount.toString() + ' but got ' + players.length.toString());
            for (i = 0; i < expectedPlayersCount; i = i + 1) {
                expectedPlayer = expectedPlayers[i];
                assertPlayer(expectedPlayer, players, i, currentSquadCount, currentItemCount, expectedPlayersCount, totalSquadCount, totalItemCount, next);
            }
        });
    };

}

module.exports = AddPlayerToSquadHelpers;