/*jslint nomen: true */
/*jslint node: true */
/*jslint newcap: true */
/*jslint plusplus: true */
/*global before, afterEach, after, featureFile, scenarios, steps */
'use strict';

var path = require('path');
var Yadda = require('yadda');
var teammanagementservice = require('../../lib/ts/TeamManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var dbhelpers = require('./common/DbHelpers');
var library = require('./CreateClub');
var yadda;
//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/CreateClub.feature');
var interpreter_context;

Yadda.plugins.mocha.StepLevelPlugin.init();

before(function (done) {
    var dbf = new databasefactory();
    dbf.levelredisasync(10, function (database) {
        var usersDb = dbf.userdb(database.leveldb),
            clubsDb = dbf.clubdb(database.leveldb),
            tms = new teammanagementservice(clubsDb);
        interpreter_context = { tms: tms, database: database, usersDb: usersDb, clubsDb: clubsDb, createdUsers: [], createdClubs: [] };
        yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
        done();
    });
});

after(function (done) {
    var dbh = new dbhelpers(),
        i;
    console.log('Test: Clean Up by removing %s clubs', interpreter_context.createdClubs.length);
    if (interpreter_context.createdClubs.length > 0) {
        for (i = 0; i < interpreter_context.createdClubs.length; i++) {
            dbh.RemoveClub(interpreter_context.clubsDb, interpreter_context.createdClubs[i].clubname, interpreter_context.createdClubs[i].cityname, done, false);
        }
    }

    console.log('Test: Clean Up by removing %s users', interpreter_context.createdUsers.length);
    if (interpreter_context.createdUsers.length > 0) {
        for (i = 0; i < interpreter_context.createdUsers.length; i++) {
            dbh.RemoveUser(interpreter_context, i, done);
        }
    } else {
        if (interpreter_context.database.clientdone) {
            interpreter_context.database.clientdone();
        }
        done();
    }
});

featureFile(featureFilePath, function (feature) {

    scenarios(feature.scenarios, function (scenario) {
        var scenario_context = { };
        steps(scenario.steps, function (step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });

    });

});