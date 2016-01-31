/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var squadplayersdb = dbFactory.squadplayersdb(db.leveldb);

function SquadPlayerRepository() {
    console.log('SquadPlayerRepository Created');
}

SquadPlayerRepository.prototype = squadplayersdb;

module.exports = SquadPlayerRepository;