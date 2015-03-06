var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var squaddb = dbFactory.squaddb(db.leveldb);

function SquadRepository() {
}
    
SquadRepository.prototype = squaddb;

module.exports = SquadRepository;