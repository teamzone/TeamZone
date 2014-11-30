/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
var path = require('path');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();
var testutility = require('../common/TestUtility');
var dbHelper = require('../../../feature-test/steps/common/DbHelpers');
var databasefactory = require('../../../lib/common/DatabaseFactory');
var assert = require('assert');
var library = require('./LoginWithEmail');
var webdriver = require('selenium-webdriver');
var driver;
var interpreter_context;
var dbh = new dbHelper();
var tu = new testutility();
var yadda;

//creating a path that works for locations, Yaddas calls is not as good as node's require and you need
//to be in the folder itself
var featureFilePath = path.resolve(__dirname, '../features/LoginWithEmail.feature');
featureFile(featureFilePath, function(feature) {

    before(function(done) {
        driver = tu.setUpRemoteSauceLabsTunnel(webdriver, tu.parseSauceLabsSettingsFromEnvironment(['Login User']));
        setupInterpreterContext(driver);
        yadda = new Yadda.Yadda(library, { interpreter_context: interpreter_context });
        done();
    });
    
    scenarios(feature.scenarios, function(scenario) {
        var scenario_context = { };
        steps(scenario.steps, function(step, done) {
            tu.executeInFlow(webdriver, function() {
                assert(interpreter_context !== undefined, 'Interpreter Context is not defined');
                //new Yadda.Yadda(library, interpreter_context).yadda(step);
                yadda.yadda(step, { scenario_context: scenario_context }, done);
            }, done);
        });
    });

    afterEach(function() {
        
    });
    
    after(function(done) {
        // ensure a clean environment
        // remove the user created going direct to DB rather than API
        for (var i = 0; i < interpreter_context.createdUsers.length; i++) { 
            dbh.RemoveUser(interpreter_context, i, allDone(driver, done));
        }
    });

    function allDone(driver, done)
    {
        driver.quit().then(done);
    }
    
});

function setupInterpreterContext(driver) {
    var dbf = new databasefactory();
    var database = dbf.levelredis();
    var usersDb = dbf.userdb(database.leveldb);
    
    interpreter_context = { database: database, usersDb: usersDb, createdUsers: [], driver: driver};
    console.log('Interpreter context is setup');
}

