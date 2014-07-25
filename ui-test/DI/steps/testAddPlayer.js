﻿/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";

var proxyquire =  require('proxyquire');
var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

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

                var pmsStub = { };
                var interpreter_context = { teamname: 'Test', year: null, driver: driver, player: null, pmsStub: pmsStub };
                new Yadda.Yadda(library, { ctx: interpreter_context }).yadda(step);
            
            }, done);
        });
    });

    afterEach(function() {
        takeScreenshotOnFailure(this.currentTest);
    });

    after(function(done) {
        driver.quit().then(done);
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