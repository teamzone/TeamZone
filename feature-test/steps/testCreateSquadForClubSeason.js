/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
"use strict";

var path = require('path');
var Yadda = require('yadda');
var teammanagementservice = require('../../lib/ts/TeamManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var dbhelpers = require('./common/DbHelpers');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/CreateSquadForClubSeason.feature');
var interpreter_context;
var usersDb;
var squadsDb;
var clubsDb;
var database;
var tms;

setupInterpreterContext();

before(function(done) {
    done();
});

after(function(done) {
    var dbh = new dbhelpers();
    console.log(interpreter_context.createdClubs[0]);
    dbh.CascadeDelete({ squadsDb: squadsDb, clubsDb: clubsDb, usersDb: usersDb }, 
                      undefined, interpreter_context.createdSquads, undefined,
                      interpreter_context.createdClubs, interpreter_context.createdUsers, done);
});

var library = require('./CreateSquadForClubSeason');
var yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
    
featureFile(featureFilePath, function(feature) {

    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { };
        steps(scenario.steps, function(step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
        
    });

});

function setupInterpreterContext() {
    var dbf = new databasefactory();
    database = dbf.levelredis();
    usersDb = dbf.userdb(database.leveldb);
    clubsDb = dbf.clubdb(database.leveldb);
    squadsDb = dbf.squaddb(database.leveldb);
    tms = new teammanagementservice(null, squadsDb);
    interpreter_context = { tms: tms, database: database, usersDb: usersDb, clubsDb: clubsDb, squadsDb: squadsDb, createdUsers: [], createdClubs: [], createdSquads: [] };
}
