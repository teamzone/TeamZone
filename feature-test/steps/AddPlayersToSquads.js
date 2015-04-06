/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
"use strict";

var English = require('yadda').localisation.English;
var testhelpers = require('./AddPlayerToSquadHelpers');
var ths;

module.exports = (function () {

    return English.library()

        // Background
        .given("The coach $coachfirstname $coachlastname is logged into the site and is a coach for $club in $city and is allocating players to squads, $squad1 and $squad2, for season $season.",
            function (coachfirstname, coachlastname, club, city, squad1, squad2, forseason, next) {
                ths = new testhelpers();
                ths.SetupBackgroundForAddPlayerToSquad(this.interpreter_context, coachfirstname, coachlastname, club, city, squad1, squad2, forseason, next);
            })

        // Scenario 1
        .given("A list of players at the club", function (next) {
            next();
        })

        .when("the coach selects player $firstname, $surname, $dob, $email", function (playerfirstname, playerlastname, playerdob, playeremail, next) {
            this.interpreter_context.playerToAddEmail = playeremail;
            //don't need all the data, can make some of it up and it's not material to the test
            ths.CreatePlayersForTheTest(this.interpreter_context, playerfirstname, playerlastname, playerdob, playeremail,
                '1 Smith Street', 'Mosman Park', '6011', '0411 213 537', next);
        })

        .when("chooses to add them to the $squadname", function (squadname, next) {
            ths.ExecuteAdditionOfPlayerToSquad(this.interpreter_context, this.interpreter_context.clubname, this.interpreter_context.cityname, 
                squadname, this.interpreter_context.season, this.interpreter_context.playerToAddEmail, 0, 1, next);
        })

        .then("the coach will have $firstname, $surname, $email listed as players in the $squad", function (playerfirstname, playerlastname, playeremail, squadname, next) {
            ths.AssertAdditionOfPlayerToSquad(this.interpreter_context.squadplayersDb, this.interpreter_context.clubname, this.interpreter_context.cityname,
                squadname, this.interpreter_context.season, playerfirstname, playerlastname, playeremail, next);
        });
}());
