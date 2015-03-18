/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
"use strict";

var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var clubdb = dbFactory.clubdb(db.leveldb);

function ClubRepository() {
    console.log('ClubRepository is created');
}

ClubRepository.prototype = clubdb;

module.exports = ClubRepository;