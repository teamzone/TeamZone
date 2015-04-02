/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
"use strict";

var path = require('path');
var Yadda = require('yadda');
var interpreter_context = {};
Yadda.plugins.mocha.StepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/AddPlayer.feature');
featureFile(featureFilePath, function(feature) {

    var library = require('./AddPlayer');
    var yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });

    before(function(done) {
        done();
    });

    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { teamname: null, year: null, dob: null, firstname: null, surname: null, address: null, suburb: null, postcode: null, email: null, Error: null };
        steps(scenario.steps, function(step, done) {
            yadda.yadda(step, { ctx: scenario_context }, done);
        });
    });

    after(function(done) {
        // ensure a clean environment
        // clear down the players storage using our API.  Let's try this out but I'm not feeling that great about this. 
        // But we are enacting the principle: Simplicity -- the art of maximising the work not done
        // we should be in a state of preparedness to make the refactoring if and when needed
        // maybe a feature request for Yadda here.  Maybe we pull down the Yadda code and submit a code change ourselves!

        var pms = interpreter_context.pms;
        var database = interpreter_context.database;
        // Question: Do we really want such an API!!!
        pms.DeletePlayers(function(err) { 
            if (err) {
                console.log('Error in deleting %s', err);
            }
         	if (database && database.redis)
         		database.redis.quit();
            if (database) 
                database.leveldb.close();    
            done();
        });
    });
});
