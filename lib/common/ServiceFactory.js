var databasefactory = require('./DatabaseFactory');
var usermanagementservice = require('../UserManagementService');
var token = require('token');
var bcrypt = require('bcrypt');
var emailverifyservice = require('../EmailVerifyService');

function ServiceFactory() {

    ///
    /// Returns the user database associated with leveldb data source
    ///
    this.CreateUserManagementService = function()
    {
        var dbf = new databasefactory();
        var database = dbf.levelredis();
        var evs = new emailverifyservice();
        initializetoken();
        return new usermanagementservice(dbf.userdb(database.leveldb), bcrypt, token, evs);
    }

    function initializetoken()
    {
        token.defaults.secret = 'ZZ-77-VV';
        token.defaults.timeStep = 96 * 60 * 60; // 96h in seconds
    }
    
}

module.exports = ServiceFactory;