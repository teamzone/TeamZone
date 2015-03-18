/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var userDb = dbFactory.userdb(db.leveldb);

function UserRepository() {
    console.log('UserRepository is created');
}
    
UserRepository.prototype = userDb;

module.exports = UserRepository;