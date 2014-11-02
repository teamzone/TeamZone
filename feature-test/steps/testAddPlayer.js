/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";
var path = require('path');
var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/AddPlayer.feature');
featureFile(featureFilePath, function(feature) {

    var library = require('./AddPlayer');
    var yadda = new Yadda.Yadda(library);

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
console.log('Processing after');
        var Pms = require('../../lib/PlayerManagementService'); // The library that you wish to test
        var pms = new Pms();
	    pms.Open(null, null);	
        // Question: Do we really want such an API!!!
        pms.DeletePlayers(function(err) { 
            if (err) 
                console.log('Error in deleting %s', err);
                
                console.log('Processing done');
            done();
        });
    });
});
