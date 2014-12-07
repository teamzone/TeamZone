var DbFactory = require('./common/DatabaseFactory');

var dbFactory = new DbFactory();

var db = dbFactory.levelredis();
var userDb = dbFactory.userdb(db.leveldb);

function UserRepository() {
}
    
UserRepository.prototype = userDb;

module.exports = UserRepository;