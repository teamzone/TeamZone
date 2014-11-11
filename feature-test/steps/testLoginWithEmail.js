/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";
var path = require('path');
var Yadda = require('yadda');
var bcrypt = require('bcrypt');
var usermanagementservice = require('../../lib/UserManagementService'); // The library that you wish to test
var databasefactory = require('../../lib/common/DatabaseFactory');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/LoginWithEmail.feature');
var usersDb;
var ums;
var interpreter_context;
var database;

setupInterpreterContext();

before(function(done) {
    done();
});

after(function(done) {
    // ensure a clean environment
    // remove the user created going direct to DB rather than API
    for (var i = 0; i < interpreter_context.createdUsers.length; i++) { 
        usersDb.del(interpreter_context.createdUsers[i].email, { sync: true }, checkforcompletion(i, done));
    }
});

function checkforcompletion(i, done)
{
    if (i === interpreter_context.createdUsers.length - 1) {
        console.log('Finished deleting')
     	if (database.redis)
     		database.redis.quit();
        database.leveldb.close();    
        done();
    }
}

var library = require('./LoginWithEmail');
var yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
    
featureFile(featureFilePath, function(feature) {

    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { loggedInUser: null };
        steps(scenario.steps, function(step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
        
    });

});

function setupInterpreterContext()
{
    var dbf = new databasefactory();
    database = dbf.levelredis();
    usersDb = dbf.userdb(database.leveldb);
    
    ums = new usermanagementservice(usersDb, bcrypt);
    
    interpreter_context = { ums: ums, usersDb: usersDb, createdUsers: []};
}

