/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var squaddb = dbFactory.squaddb(db.leveldb);

function SquadRepository() {
    console.log('Squad Reposity Created');
}

SquadRepository.prototype = squaddb;

module.exports = SquadRepository;