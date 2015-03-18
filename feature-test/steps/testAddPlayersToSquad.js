/*jslint nomen: true */
/*jslint node: true */
/*jslint newcap: true */
/*global before, afterEach, after, featureFile, scenarios, steps */
'use strict';

var path = require('path');
var Yadda = require('yadda');
var assert = require('assert');
var teammanagementservice = require('../../lib/ts/TeamManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var dbhelpers = require('./common/DbHelpers');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/AddPlayersToSquad.feature');
var interpreter_context;
var usersDb;
var squadsDb;
var squadplayersDb;
var clubsDb;
var playersDb;
var database;
var tms;

function setupInterpreterContext() {
    var dbf = new databasefactory();
    database = dbf.levelredis();
    usersDb = dbf.userdb(database.leveldb);
    clubsDb = dbf.clubdb(database.leveldb);
    squadsDb = dbf.squaddb(database.leveldb);
    squadplayersDb = dbf.squadplayersdb(database.leveldb);
    playersDb = dbf.playerdb(database.leveldb);
    tms = new teammanagementservice(null, squadsDb, playersDb, squadplayersDb);
    interpreter_context = { tms: tms, database: database,
                            playersDb: playersDb, usersDb: usersDb, clubsDb: clubsDb, squadsDb: squadsDb, squadplayersDb: squadplayersDb,
                            createdPlayers: [], createdUsers: [], createdClubs: [], createdSquads: [],
                            createdSquadPlayers: [] };
}

setupInterpreterContext();

before(function (done) {
    done();
});

after(function (done) {
    var dbh = new dbhelpers();
    dbh.CascadeDelete({ playersDb: playersDb, squadsDb: squadsDb, squadplayersDb: squadplayersDb, clubsDb: clubsDb, usersDb: usersDb },
                      interpreter_context.createdPlayers, interpreter_context.createdSquads, interpreter_context.createdSquadPlayers,
                      interpreter_context.createdClubs, interpreter_context.createdUsers, done);
});

var library = require('./AddPlayersToSquad');
var yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });

featureFile(featureFilePath, function (feature) {

    scenarios(feature.scenarios, function (scenario) {
        var scenario_context = { };
        steps(scenario.steps, function (step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
    });

});