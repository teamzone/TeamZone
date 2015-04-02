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

Yadda.plugins.mocha.StepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/CreateClubs.feature');
var interpreter_context;
var usersDb;
var clubsDb;
var database;
var tms;

function setupInterpreterContext() {
    var dbf = new databasefactory();
    database = dbf.levelredis();
    usersDb = dbf.userdb(database.leveldb);
    clubsDb = dbf.clubdb(database.leveldb);
    tms = new teammanagementservice(clubsDb);
    interpreter_context = { tms: tms, database: database, usersDb: usersDb, clubsDb: clubsDb, createdUsers: [], createdClubs: [] };
}

setupInterpreterContext();

before(function (done) {
    done();
});

after(function (done) {
    var dbh = new dbhelpers();
    dbh.CascadeDelete({ clubsDb: clubsDb, usersDb: usersDb },
                      undefined, undefined, undefined,
                      interpreter_context.createdClubs, interpreter_context.createdUsers, done);
});

var library = require('./CreateClubs');
var yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });

featureFile(featureFilePath, function (feature) {
    scenarios(feature.scenarios, function (scenario) {
        var scenario_context = { };
        steps(scenario.steps, function (step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
    });
});