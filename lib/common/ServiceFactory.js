var databasefactory = require('./DatabaseFactory');
var usermanagementservice = require('../UserManagementService');
var token = require('token');
var bcrypt = require('bcrypt');
var emailverifyservice = require('../EmailVerifyService');
var nodeMailerVerifyService = require('../MailGunEmailVerifyService');

function ServiceFactory() {

    ///
    /// Returns the user database associated with leveldb data source
    ///
    this.CreateUserManagementService = function(realEmail)
    {
        var dbf = new databasefactory();
        var database = dbf.levelredis();
        var evs;
        initializetoken();
        if (realEmail) {
            //evs = new nodeMailerVerifyService(null, null, 'registrations@mg.aboutagile.com', 'http://www.myteamzone.com/regVerify', 'mailgun', 'user@mailgun.org', 'password');
            evs = new nodeMailerVerifyService(null, null, realEmail.fromAddress, realEmail.baseUrl, realEmail.mailServiceName, realEmail.userName, realEmail.password);
            return new usermanagementservice(dbf.userdb(database.leveldb), bcrypt, token, evs);
        }
        else {
            evs = new emailverifyservice();
            return new usermanagementservice(dbf.userdb(database.leveldb), bcrypt, token, evs);
        }
    }

    function initializetoken()
    {
        token.defaults.secret = 'ZZ-77-VV';
        token.defaults.timeStep = 96 * 60 * 60; // 96h in seconds
    }
    
}

module.exports = ServiceFactory;