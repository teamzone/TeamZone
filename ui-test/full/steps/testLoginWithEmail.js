/*jslint node: true */
/*jslint newcap: true */
/*jslint plusplus: true */
/*global before, beforeEach, afterEach, after, featureFile, scenarios, steps */
/*jslint nomen: true */
"use strict";

var Yadda = require('yadda');
var path = require('path');
var testutility = require('../common/TestUtility');
var dbHelper = require('../../../feature-test/steps/common/DbHelpers');
var databasefactory = require('../../../lib/common/DatabaseFactory');
var assert = require('assert');
var library = require('./LoginWithEmail');
//var webdriver = require('selenium-webdriver');
var driver;
var interpreter_context;
var dbh = new dbHelper();
var tu = new testutility();
var yadda;

Yadda.plugins.mocha.StepLevelPlugin.init();

before(function(done) {
    driver = tu.setUpRemoteUITestTunnel(webdriver);
    setupInterpreterContext(driver);
    yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
    done();
});

after(function(done) {
    // ensure a clean environment
    // remove the user created going direct to DB rather than API
    for (var i = 0; i < interpreter_context.createdUsers.length; i++) { 
        dbh.RemoveUser(interpreter_context, i, allDone(driver, done));
    }
});
            
//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/LoginWithEmail.feature');
featureFile(featureFilePath, function(feature) {
    
    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { };
        steps(scenario.steps, function(step, done) {
            yadda.yadda(step, { scenario_context: scenario_context }, done);
        });
    });    
    
});

function setupInterpreterContext(driver) {
    var dbf = new databasefactory();
    var database = dbf.levelredis();
    var usersDb = dbf.userdb(database.leveldb);
    
    interpreter_context = { database: database, usersDb: usersDb, createdUsers: [], driver: driver};
    console.log('Interpreter context is setup');
}

function allDone(driver, done)
{
    driver.quit().then(function() {
            done();
    }, done);
}