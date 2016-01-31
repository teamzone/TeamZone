/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
"use strict";

var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var playerdb = dbFactory.playerdb(db.leveldb);

function PlayerRepository() {
    console.log('PlayerRepository is created');
}

PlayerRepository.prototype = playerdb;

module.exports = PlayerRepository;