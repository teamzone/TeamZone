var levelup = require('levelup');
var levelstore = require('redisdown');
var sublevel = require('level-sublevel');
var url = require('url');
var redis = require('redis');
var poolRedis = require('pool-redis');

/* @class
 * Used to get instances to sublevel 'table like' entities representation of our data
 *
*/
function DatabaseFactory() {
    /*
    * Returns a ths uppermost sublevel instance linked to a Redis backing store
    */
    this.levelredis = function() {
        //see this being injected by DI in the future
        var redisURL = url.parse(process.env.REDISTOGO_URL);
    
        var redisclient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
    
        redisclient.auth(redisURL.auth.split(":")[1]);

        var levelupdb = levelup('TeamZoneDB', {
                            	valueEncoding: 'json',
                                // the 'db' option replaces LevelDOWN
                                db: levelstore, redis: redisclient
                            });
        var leveldb = sublevel(levelupdb);
        
        return { leveldb: leveldb, redis: redisclient };
    };

    /*
    * Returns a ths uppermost sublevel instance linked to a Redis backing store
    */
    this.levelredisasync = function(maxconnections, next) {
        
        var redisURL = url.parse(process.env.REDISTOGO_URL);
        var poolredis = new poolRedis({
            'host': redisURL.hostname,
            'port': redisURL.port,
            'password': redisURL.auth.split(":")[1],
            'maxConnections': maxconnections
        });
        
        poolredis.getClient(function (redisclient, done) {
            var levelupdb = levelup('TeamZoneDB', {
                                	valueEncoding: 'json',
                                    // the 'db' option replaces LevelDOWN
                                    db: levelstore, redis: redisclient
                                });
            var leveldb = sublevel(levelupdb);
            
            next({ leveldb: leveldb, redis: redisclient, clientdone: done });
        });
    
    };
    
    /*
    * Returns the user database associated with sublevel data source. userdb is top of a hierarchy.
    * @param {object} subleveldb - the uppermost sublevel instance
    */
    this.userdb = function(subleveldb) {
        return subleveldb.sublevel('users');
    };

    /*
    * Returns the club database associated with sublevel data source, clubdb is top of a hierarchy.
    * @param {object} subleveldb - the uppermost sublevel instance
    */
    this.clubdb = function(subleveldb) {
        return subleveldb.sublevel('clubs');
    };

    /*
    * Returns the squad database associated with clubdb data source.  Because it is under a club it should
    * be created under one. The code will do this for you.
    * @param {object} subleveldb - the uppermost sublevel instance
    */
    this.squaddb = function(subleveldb) {
        return this.clubdb(subleveldb).sublevel('squads');
    };

    /*
    * Returns the squad players database associated with squads data source. Because it is under a club it should
    * be created under one. The code will do this for you.  
    * @param {object} subleveldb - the uppermost sublevel instance
    */
    this.squadplayersdb = function(subleveldb) {
        return this.squaddb(subleveldb).sublevel('squadplayers');
    };

    /*
    * Returns the player database associated with clubdb data source.  Because it is under a club it should
    * be created under one. The code will do this for you.
    * @param {object} subleveldb - the uppermost sublevel instance
    */
    this.playerdb = function(subleveldb) {
        return this.clubdb(subleveldb).sublevel('players');
    };

}

module.exports = DatabaseFactory;