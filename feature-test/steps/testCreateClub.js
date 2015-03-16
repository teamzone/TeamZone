/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
"use strict";

var path = require('path');
var Yadda = require('yadda');
var bcrypt = require('bcrypt');
var assert = require('assert');
var teammanagementservice = require('../../lib/TeamManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var dbhelpers = require('./common/DbHelpers');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/CreateClub.feature');
var interpreter_context;
var usersDb;
var clubsDb;
var database;
var tms;

setupInterpreterContext();

before(function(done) {
    done();
});

after(function(done) {
    var dbh = new dbhelpers();
    console.log('Test: Clean Up by removing %s clubs', interpreter_context.createdClubs.length);
    if (interpreter_context.createdClubs.length > 0)
        for (var i = 0; i < interpreter_context.createdClubs.length; i++) 
            dbh.RemoveClub(clubsDb, interpreter_context.createdClubs[i].clubname, interpreter_context.createdClubs[i].cityname, done, false);
            
    console.log('Test: Clean Up by removing %s users', interpreter_context.createdUsers.length);
    if (interpreter_context.createdUsers.length > 0)
        for (var i = 0; i < interpreter_context.createdUsers.length; i++) 
            dbh.RemoveUser(interpreter_context, i, done);
    else
        done();
});

var library = require('./CreateClub');
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
    tms = new teammanagementservice(clubsDb);
    interpreter_context = { tms: tms, database: database, usersDb: usersDb, clubsDb: clubsDb, createdUsers: [], createdClubs: [] };
}
