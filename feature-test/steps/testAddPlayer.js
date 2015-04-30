/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
"use strict";

var path = require('path');
var Yadda = require('yadda');
var playermanagementservice = require('../../lib/ts/PlayerManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var dbhelpers = require('./common/DbHelpers');
var interpreter_context;
var library = require('./AddPlayer');
var yadda;

Yadda.plugins.mocha.StepLevelPlugin.init();

before(function (done) {
    var dbf = new databasefactory();
    dbf.levelredisasync(10, function (database) {
        var usersDb = dbf.userdb(database.leveldb),
            clubsDb = dbf.clubdb(database.leveldb),
            playersDb = dbf.playerdb(database.leveldb),
            pms = new playermanagementservice(playersDb);
        interpreter_context = { pms: pms, database: database, usersDb: usersDb, clubsDb: clubsDb, playersDb: playersDb, createdUsers: [], createdClubs: [], createdPlayers: [] };
        yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
        done();
    });
});

after(function (done) {
    var dbh = new dbhelpers();
    dbh.CascadeDelete({ squadsDb: interpreter_context.squadsDb, clubsDb: interpreter_context.clubsDb, usersDb: interpreter_context.usersDb, playersDb: interpreter_context.playersDb },
                      interpreter_context.createdPlayers, undefined, undefined, interpreter_context.createdClubs, interpreter_context.createdUsers,
        function () {
            if (interpreter_context.database.clientdone) {
                interpreter_context.database.clientdone();
            }
            done();
        });
});

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/AddPlayer.feature');
featureFile(featureFilePath, function(feature) {

    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { };
        steps(scenario.steps, function(step, done) {
            yadda.yadda(step, { ctx: scenario_context }, done);
        });
    });

});
