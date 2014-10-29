var levelup = require('levelup');
var levelstore = require('redisdown');
var sublevel = require('level-sublevel');
var url = require('url');
var redis = require('redis');

///
/// Returns a LevelDb instance linked to a Redis backing store
///
function levelredis()
{
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
}

///
/// Returns the user database associated with leveldb data source
///
function userdb(leveldb)
{
    return leveldb.sublevel('users');
}