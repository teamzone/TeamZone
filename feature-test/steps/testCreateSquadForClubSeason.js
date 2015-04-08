/*jslint nomen: true */
/*jslint node: true */
/*jslint newcap: true */
/*global before, afterEach, after, featureFile, scenarios, steps */
'use strict';

var path = require('path');
var Yadda = require('yadda');
var teammanagementservice = require('../../lib/ts/TeamManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var dbhelpers = require('./common/DbHelpers');
//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/CreateSquadForClubSeason.feature');
var interpreter_context;
var library = require('./CreateSquadForClubSeason');
var yadda;

Yadda.plugins.mocha.StepLevelPlugin.init();

// function setupInterpreterContext() {
//     var dbf = new databasefactory();
//     database = dbf.levelredis();
//     usersDb = dbf.userdb(database.leveldb);
//     clubsDb = dbf.clubdb(database.leveldb);
//     squadsDb = dbf.squaddb(database.leveldb);
//     tms = new teammanagementservice(null, squadsDb);
//     interpreter_context = { tms: tms, database: database, usersDb: usersDb, clubsDb: clubsDb, squadsDb: squadsDb, createdUsers: [], createdClubs: [], createdSquads: [] };
// }

// setupInterpreterContext();

before(function (done) {
    var dbf = new databasefactory();
    dbf.levelredisasync(10, function (database) {
        var usersDb = dbf.userdb(database.leveldb),
            clubsDb = dbf.clubdb(database.leveldb),
            squadsDb = dbf.squaddb(database.leveldb),
            tms = new teammanagementservice(null, squadsDb);
        interpreter_context = { tms: tms, database: database, usersDb: usersDb, clubsDb: clubsDb, squadsDb: squadsDb, createdUsers: [], createdClubs: [], createdSquads: [] };
        yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
        done();
    });
});

after(function (done) {
    var dbh = new dbhelpers();
    console.log(interpreter_context.createdClubs[0]);
    dbh.CascadeDelete({ squadsDb: interpreter_context.squadsDb, clubsDb: interpreter_context.clubsDb, usersDb: interpreter_context.usersDb },
                      undefined, interpreter_context.createdSquads, undefined,
                      interpreter_context.createdClubs, interpreter_context.createdUsers, 
        function () {
            if (interpreter_context.database.clientdone) {
                interpreter_context.database.clientdone();
            }
            done();
        });
});

featureFile(featureFilePath, function (feature) {
    scenarios(feature.scenarios, function (scenario) {
        var scenario_context = { };
        steps(scenario.steps, function (step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
    });
});