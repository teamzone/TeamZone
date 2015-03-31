/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
"use strict";

var levelup = require('levelup');
var levelstore = require('redisdown');
var sublevel = require('level-sublevel');
var moment = require('moment');
var url = require('url');
var redis = require('redis');

function PlayerManagementService() {

    var levelDb = null,
        teamsDb = null,
        redisclient = null;

    // Sets up the database to default settings
    this.Open = function (db, leveldbArg) {
        if (db === null) {
            var redisURL = url.parse(process.env.REDISTOGO_URL);
            redisclient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
            redisclient.auth(redisURL.auth.split(":")[1]);
            var levelupdb = levelup('TeamZoneDB', {
                    valueEncoding: 'json',
                    // the 'db' option replaces LevelDOWN
                    db: levelstore, 
                    redis: redisclient
                });
            levelDb = sublevel(levelupdb);
            teamsDb = levelDb.sublevel('teams');
        } else {
            //supporting the passing in of mocked database
            teamsDb = db;
            if (leveldbArg !== undefined)
                levelDb = leveldbArg;
        }
    };

    this.AddPlayer = function(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback) {
        
        if (isValidDate(dob, callback)) {      
            //check that the record does not exist anymore
            var key = keyMaker(teamname, firstname, surname);

			//check that the record does not exist anymore
            teamsDb.get(key, function(err, value) {
                
                if (err && !err.notFound) {
                	closeConnections();
                    callback(err, null);
                } else {
		            if (value) 
                    {
                       closeConnections();
                       callback(new Error('Cannot add this player, the player already exists', null));
                    }
                    else
                    {
                        teamsDb.put(key, { dob: dob, address: address, suburb: suburb, postcode: postcode, phone: phone, email: email }, { sync: true }, 
					        function (err) {
					        	closeConnections();                                                                                                            
						        if (err) 
                                    callback(err, null);
                                else
                                    //it worked nothing to return
                                    callback(null, null);
				            });
                     }
                }
             });
         }

	}

	this.GetPlayer = function(teamname, firstname, surname, callback) {
		teamsDb.get(keyMaker(teamname, firstname, surname), function (err, value) { 
                    closeConnections();
                    if (err) {
                        callback(err);
                    } else {
                        //recompose the object to include the key values
                        var playerObject = {
                            teamname: teamname,
                            firstname: firstname,
                            surname: surname,
                            dob: value.dob,
                            address: value.address,
                            suburb: value.suburb,
                            postcode: value.postcode,
                            phone: value.phone,
                            email: value.email
                        };
					    callback(err, playerObject);
                    }
				});
	}

    this.DeletePlayers = function(callback) {
        teamsDb.createKeyStream()
            .on('data', function(keyValue) {
                teamsDb.del(keyValue, { sync: true }, function (err) {
                    if (err) {
                        callback(err);
                    }
                    return;
                });
             })
             .on('close', function() {
             	closeConnections();
             	callback();
             })
             .on('error', function(err) {
             	closeConnections();
                callback(err);      
             });
    };

	function closeConnections() {
	 	if (redisclient)
	 		redisclient.quit();
	    levelDb.close();	
	}
	
    function keyMaker(teamname, firstname, surname) {
        return "".concat(teamname, "~", firstname, "~", surname, "~");
    }

    function isValidDate(d, callback) {
        	
        var validDateFormats = ['DD MMM YYYY', 'D MMM YYYY', 'DD-MM-YYYY', 'D/MM/YYYY', 'D/M/YYYY', 'DD-MMM-YYYY', 'YYYY-MM-DD'];

        var i = 0;
        var len = validDateFormats.length;
        var isValid = false;
        for (; i < len; ) { 
            if ((new moment(d, validDateFormats[i], true)).isValid()) 
            {
                isValid = true;
                i = len;
            }
            i++;
        } 
        if (!isValid) 
        {
            callback(new Error('The date is in an incorrect format'));
            return false;
        }
        else
            return true;
    }
}

module.exports = PlayerManagementService;