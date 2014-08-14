/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

var Pms = require('../../../lib/PlayerManagementService');
var library = require('./AddPlayer');
var webdriver = require('selenium-webdriver');
var fs = require('fs');
var driver;

featureFile('../features/AddPlayer.feature', function(feature) {

    before(function(done) {
        driver = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'firefox'}).build();
        driver.manage().timeouts().implicitlyWait(10000);
        done();
    });

    scenarios(feature.scenarios, function(scenario) {
        steps(scenario.steps, function(step, done) {
            executeInFlow(function() {

                var interpreter_context = { teamname: 'Test', year: null, driver: driver };
                new Yadda.Yadda(library, interpreter_context).yadda(step);
            
            }, done);
        });
    });

    afterEach(function() {
        takeScreenshotOnFailure(this.currentTest);
    });

    after(function(done) {
        // ensure a clean environment
        // clear down the players storage using our API.  Let's try this out but I'm not feeling that great about this. 
        // But we are enacting the principle: Simplicity -- the art of maximising the work not done
        // we should be in a state of preparedness to make the refactoring if and when needed
        // maybe a feature request for Yadda here.  Maybe we pull down the Yadda code and submit a code change ourselves!

        var Pms = require('../../../lib/PlayerManagementService'); // The library that you wish to test
        var pms = new Pms();
	    pms.Open(null);	
        // Question: Do we really want such an API!!!
        pms.DeletePlayers(function(err) { 
            if (err) 
                console.log('Error in deleting %s', err);
            driver.quit().then(done);
        });
    });
});

function executeInFlow(fn, done) {
    webdriver.promise.controlFlow().execute(fn).then(function() {
        done();
    }, done);
}

function takeScreenshotOnFailure(test) {
    if (test.status != 'passed') {
        var path = 'screenshots/' + test.title.replace(/\W+/g, '_').toLowerCase() + '.png';
        driver.takeScreenshot().then(function(data) {
            fs.writeFileSync(path, data, 'base64');
        });
    }
}