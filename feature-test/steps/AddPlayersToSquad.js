/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it */
/*jslint nomen: true */
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

module.exports = (function() {
	
  return English.library()
	
	// Background
	.given("The coach $coachfirstname $coachlastname is logged into the site and is a coach for $club in $city and is looking after two squads $squad1 and $squad2 for the $season season.", 
	  function(coachfirstname, coachlastname, club, city, squad1, squad2, forseason, next) {	
	    clubname = club;
	    cityname = city;
	    squadname1 = squad1;
	    squadname2 = squad2;
	    season = forseason;
	    tms = this.interpreter_context.tms;
	    var createdUsers = this.interpreter_context.createdUsers;
	    var createdClubs = this.interpreter_context.createdClubs;
	    var createdSquads = this.interpreter_context.createdSquads;
	    var usersDb = this.interpreter_context.usersDb;	
	    var clubsDb = this.interpreter_context.clubsDb;
	    var squadsDb = this.interpreter_context.squadsDb;
	    dbh = new dbhelpers(true);
	    // create the sample user, making up the password and email address as being declarative in the feature makes it a bit easier to manage. Email is the key
	    coachemail = coachfirstname + '.' + coachlastname + '@gmail.com';
        // create the sample club name, some fields can be made up as they aren't material to the test
        dbh.CreateClub(clubsDb, createdClubs, club, city, 'Burswood Oval', 'Burswood', 'admin@gmail.com', next, false);
        dbh.CreateSquad(squadsDb, createdSquads, squadname1, season, 'over 16', coachemail, next, false);
        dbh.CreateSquad(squadsDb, createdSquads, squadname2, season, 'over 16', coachemail, next, false);
        dbh.CreateUser(usersDb, createdUsers, coachfirstname, coachlastname, 'SomePassword', coachemail, '', true, next);
    })
    
    // Scenario 1
    .given("A list of older players playing at the club", function(next) {
       next();
    })
	
    .when("the coach selects player $firstname, $surname, $dob, $email", function(playerfirstname, playerlastname, playerdob, playeremail, next) {
        //these players need to be added as players to the db for the next part of the test to work
        var playersDb = this.interpreter_context.playersDb;
        var createdPlayers = this.interpreter_context.createdPlayers;
        playerToAddEmail = playeremail;
        //don't need all the data, can make some of it up and it's not material to the test
        dbh.CreatePlayer(playersDb, createdPlayers, playeremail, playerfirstname, 
                         playerlastname, playerdob, '1 Smith Street', 'Mosman Park', '6011', '0411 213 537', next, true);
    })

    .when("chooses to add them to the $squadname squad", function(squadname, next) {
        console.log('Checking squad');
        targetsquad = squadname;
        var createdSquadPlayers = this.interpreter_context.createdSquadPlayers;
        tms.AddPlayerToSquad(squadname, season, playerToAddEmail, function(err) {
            assert.ifError(err, 'Failed because of error in AddPlayerToSquad');
            createdSquadPlayers.push({
               squad: squadname, season: season, email: playerToAddEmail 
            });    
            next();
        });
    })
    
    .then("the coach will have $firstname, $surname, $email listed as players as they conform to the age limit", function(playerfirstname, playerlastname, playeremail, next) {
        console.log('Check is it in the squad');
        var squadPlayersDb = this.interpreter_context.squadplayersDb;
        dbh.GetSquadPlayers(squadPlayersDb, targetsquad, season, function(err, players) {
           assert.ifError(err, 'Failure to get squad players for squad ' + targetsquad + ' in season ' + season);
           assert(players.length > 0, 'Expected players to be in the squad');
           assert(_.find(players, function(p) { return p.value.playeremail === playeremail }), playeremail + ' not found in Squad Players');
           next();
        });
    });
    
})();
