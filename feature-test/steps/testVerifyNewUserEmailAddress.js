/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";
var path = require('path');
var Yadda = require('yadda');
var bcrypt = require('bcrypt');
var assert = require('assert');
var usermanagementservice = require('../../lib/UserManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');
var emailverifyservice = require('../../lib/EmailVerifyService');
var token = require('token');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/VerifyNewUserEmailAddress.feature');
var usersDb;
var ums;
var interpreter_context;
var database;

setupInterpreterContext();

before(function(done) {
    done();
});

after(function(done) {
    console.log('Test: Clean Up by removing %s users', interpreter_context.createdUsers.length);
    // remove the user created going direct to DB rather than API
    if (interpreter_context.createdUsers.length > 0)
        for (var i = 0; i < interpreter_context.createdUsers.length; i++) 
            removeUser(i, done);
    else
        done();
});

function removeUser(userCount, done)
{
     usersDb.del(interpreter_context.createdUsers[userCount].email, { sync: true }, function(err) {
         if (err) {
            console.log('Error whilst deleting');
            assert.ifError(err);
         }
         else
            checkforcompletion(userCount, done);
     });
}

function checkforcompletion(userCount, done)
{
    if (userCount === interpreter_context.createdUsers.length - 1) {
     	if (database.redis)
     		database.redis.quit();
        database.leveldb.close();    
        console.log('Completed cleanup');
        done();
    }
}

var library = require('./VerifyNewUserEmailAddress');
var yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
    
featureFile(featureFilePath, function(feature) {

    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { loggedInUser: null };
        steps(scenario.steps, function(step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
        
    });

});

function setupInterpreterContext() {
    var dbf = new databasefactory();
    var evs = new emailverifyservice();
    
    token.defaults.secret = 'ZZVV';
    token.defaults.timeStep = 96 * 60 * 60; // 96h in seconds
    
    database = dbf.levelredis();
    usersDb = dbf.userdb(database.leveldb);
    
    ums = new usermanagementservice(usersDb, bcrypt, token, evs);
    
    interpreter_context = { ums: ums, usersDb: usersDb, createdUsers: [], token: token};
}

