/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";
var path = require('path');
var Yadda = require('yadda');
var levelup = require('levelup');
var levelstore = require('redisdown');
var sublevel = require('level-sublevel');
var url = require('url');
var redis = require('redis');
var bcrypt = require('bcrypt');
var assert = require('assert');
var usermanagementservice = require('../../lib/UserManagementService'); // The library that you wish to test

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/LoginWithEmail.feature');
var redisclient;
var levelDb;
var usersDb;
var ums;
var interpreter_context;

setupInterpreterContext();

before(function(done) {
    done();
});

after(function(done) {
    // ensure a clean environment
    // remove the user created going direct to DB rather than API
    for (var i = 0; i < interpreter_context.createdUsers.length; i++) { 
        usersDb.del(interpreter_context.createdUsers[i].email, { sync: true }, function (err) {
            assert.ifError(err, 'Error in deleting test user ' + interpreter_context.createdUsers[i].email)
        });
    }
 	if (redisclient)
 		redisclient.quit();
    levelDb.close();    
    done();
});

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
    //see this being injected by DI in the future
    var redisURL = url.parse(process.env.REDISTOGO_URL);

    redisclient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});

    redisclient.auth(redisURL.auth.split(":")[1]);

    var levelupdb = levelup('TeamZoneDB', {
                        	valueEncoding: 'json',
                            // the 'db' option replaces LevelDOWN
                            db: levelstore, redis: redisclient
                        });
    levelDb = sublevel(levelupdb);
    usersDb = levelDb.sublevel('users');

    ums = new usermanagementservice(levelDb, usersDb, bcrypt);
    
    interpreter_context = { ums: ums, usersDb: usersDb, createdUsers: []};
}

