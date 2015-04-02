/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var assert = require('assert');
var _ = require("underscore");
var English = require('yadda').localisation.English;
var dbhelpers = require('./common/DbHelpers');
var tms;
var clubname;
var squadname1;
var squadname2;
var cityname;
var coachemail;
var season;
var targetsquad;
var playerToAddEmail;
var dbh;

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
function createPlayersForTheTest(interpreter_context, playerfirstname, playerlastname,
    playerdob, playeremail, playeraddress, playersuburb, playerpostcode, playerphone, next) {
    //these players need to be added as players to the db for the next part of the test to work
    var playersDb = interpreter_context.playersDb,
        createdPlayers = interpreter_context.createdPlayers;
    playerToAddEmail = playeremail;
    dbh.CreatePlayer(playersDb, createdPlayers, playeremail, playerfirstname,
                     playerlastname, playerdob, playeraddress, playersuburb,
                     playerpostcode, playerphone, next, true);
}

module.exports = (function () {

    return English.library()

        // Background
        .given("The coach $coachfirstname $coachlastname is logged into the site and is a coach for $club in $city and is allocating players to squads, $squad1 and $squad2, for season $season.",
            function (coachfirstname, coachlastname, club, city, squad1, squad2, forseason, next) {
                clubname = club;
                cityname = city;
                squadname1 = squad1;
                squadname2 = squad2;
                season = forseason;
                tms = this.interpreter_context.tms;
                var createdUsers = this.interpreter_context.createdUsers,
                    createdClubs = this.interpreter_context.createdClubs,
                    createdSquads = this.interpreter_context.createdSquads,
                    usersDb = this.interpreter_context.usersDb,
                    clubsDb = this.interpreter_context.clubsDb,
                    squadsDb = this.interpreter_context.squadsDb;
                dbh = new dbhelpers(true);
                // create the sample user, making up the password and email address as being declarative in the feature makes it a bit easier to manage. Email is the key
                coachemail = coachfirstname + '.' + coachlastname + '@gmail.com';
                // create the sample club name, some fields can be made up as they aren't material to the test
                dbh.CreateClub(clubsDb, createdClubs, club, city, 'Burswood Oval', 'Burswood', 'admin@gmail.com', next, false);
                dbh.CreateSquad(squadsDb, createdSquads, club, city, squadname1, season, 'over 16', coachemail, next, false);
                dbh.CreateSquad(squadsDb, createdSquads, club, city, squadname2, season, 'over 16', coachemail, next, false);
                dbh.CreateUser(usersDb, createdUsers, coachfirstname, coachlastname, 'SomePassword', coachemail, '', true, next);
            })

        // Scenario 1
        .given("A list of players at the club", function (next) {
            next();
        })

        .when("the coach selects player $firstname, $surname, $dob, $email", function (playerfirstname, playerlastname, playerdob, playeremail, next) {
            //don't need all the data, can make some of it up and it's not material to the test
            createPlayersForTheTest(this.interpreter_context, playerfirstname, playerlastname, playerdob, playeremail,
                '1 Smith Street', 'Mosman Park', '6011', '0411 213 537', next);
        })

        .when("chooses to add them to the $squadname", function (squadname, next) {
            targetsquad = squadname;
            var createdSquadPlayers = this.interpreter_context.createdSquadPlayers;
            tms.AddPlayerToSquad(clubname, cityname, squadname, season, playerToAddEmail, function (err) {
                if (err) {
                    assert.fail(err, undefined, "Failed because of error in AddPlayerToSquad:  " + err.message);
                }
                createdSquadPlayers.push({
                    club: clubname,
                    city: cityname,
                    squad: squadname,
                    season: season,
                    email: playerToAddEmail
                });
                console.log('Successfully added the player %s to the squad %s', playerToAddEmail, targetsquad);
                next();
            });
        })

        .then("the coach will have $firstname, $surname, $email listed as players in the $squad", function (playerfirstname, playerlastname, playeremail, squadname, next) {
            var squadPlayersDb = this.interpreter_context.squadplayersDb;
            dbh.GetSquadPlayers(squadPlayersDb, squadname, season, function (err, players) {
                if (err) {
                    assert.fail(err, undefined, 'Failure to get squad players for squad ' + squadname + ' in season ' + season + ' because of error: ' + err.message);
                }
                assert(players.length > 0, 'Expected players to be in the squad');
                assert(_.find(players, function (p) { return p.value.playeremail === playeremail; }), playerfirstname + '.' +  playerlastname + ' ' + playeremail + ' not found in Squad Players');
                next();
            });
        });
}());
