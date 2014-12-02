/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";

var webdriver = require('selenium-webdriver');

var Yadda = require('yadda');
var path = require('path');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

var library = require('./AddPlayer');
var fs = require('fs');

// checking sauce credential
if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
    console.warn(
        '\nPlease configure your sauce credential:\n\n' +
        'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
        'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
    );
    throw new Error("Missing sauce credentials");
}

var desired = JSON.parse(process.env.DESIRED || '{browserName: "chrome"}');
desired.name = 'example with ' + desired.browserName;
desired.tags = ['Add Player'];
var driver;

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/AddPlayer.feature');
featureFile(featureFilePath, function(feature) {

    var allPassed = true;

    before(function(done) {
        var username = process.env.SAUCE_USERNAME;
        var accessKey = process.env.SAUCE_ACCESS_KEY;
        desired.username = username;
        desired.accessKey = accessKey;
        
        var remoteUrl = "http://ondemand.saucelabs.com:80/wd/hub";
        driver = new webdriver.Builder().usingServer(remoteUrl).withCapabilities(desired).build();
        driver.manage().timeouts().implicitlyWait(10000);
        done();
    });

    afterEach(function(done) {
        //takeScreenshotOnFailure(this.currentTest);
        allPassed = allPassed && (this.currentTest.state === 'passed');  
        done();
    });

    after(function(done) {
        // ensure a clean environment
        // clear down the players storage using our API.  Let's try this out but I'm not feeling that great about this. 
        // Known as going in through the front door
        // But we are enacting the principle: Simplicity -- the art of maximising the work not done
        // we should be in a state of preparedness to make the refactoring if and when needed
        // maybe a feature request for Yadda here.  Maybe we pull down the Yadda code and submit a code change ourselves!

        var Pms = require('../../../lib/PlayerManagementService'); // The library that you wish to test
        var pms = new Pms();
	    pms.Open(null, null);	    
        pms.DeletePlayers(function(err) { 
            if (err) 
                console.log('Error in deleting %s', err);
            driver
                .quit()
                .then(done);
        });
    });
    
    scenarios(feature.scenarios, function(scenario) {
        steps(scenario.steps, function(step, done) {
            executeInFlow(function() {

                var interpreter_context = { teamname: null, year: null, driver: driver };
                new Yadda.Yadda(library, interpreter_context).yadda(step);
            
            }, done);
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
        
        var scrpath = path.resolve(__dirname, 'screenshots/') + test.title.replace(/\W+/g, '_').toLowerCase() + '.png';
        driver.takeScreenshot().then(function(data) {
            fs.writeFileSync(scrpath, data, 'base64');
        });
    }
}