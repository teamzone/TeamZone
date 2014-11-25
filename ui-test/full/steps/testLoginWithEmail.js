/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
var path = require('path');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();
var testUtility = require('../common/testUtility');
var dbHelper = require('../../../feature-test/steps/common/DbHelpers');
var databasefactory = require('../../../lib/common/DatabaseFactory');

var library = require('./LoginWithEmail');
var webdriver = require('selenium-webdriver');
var driver;
var interpreter_context = { createdUsers: [] };
var dbh = new dbHelper();

setupInterpreterContext();

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/LoginWithEmail.feature');
featureFile(featureFilePath, function(feature) {

    before(function(done) {
        driver = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();
        driver.manage().timeouts().implicitlyWait(10000);
        done();
    });

    scenarios(feature.scenarios, function(scenario) {
        steps(scenario.steps, function(step, done) {
            testUtility.executeInFlow(webdriver, function() {

                new Yadda.Yadda(library, interpreter_context).yadda(step);
            
            }, done);
        });
    });

    afterEach(function() {
        testUtility.takeScreenshotOnFailure(driver, this.currentTest);
    });
    
    after(function(done) {
        // ensure a clean environment
        // remove the user created going direct to DB rather than API
        for (var i = 0; i < interpreter_context.createdUsers.length; i++) { 
            dbHelper.RemoveUser(i, done);
        }
    });

});

function setupInterpreterContext() {
    var dbf = new databasefactory();
    var database = dbf.levelredis();
    var usersDb = dbf.userdb(database.leveldb);
    
    interpreter_context = { database: database, usersDb: usersDb, createdUsers: []};

}

