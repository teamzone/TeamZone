var connection = 'DefaultEndpointsProtocol=https;AccountName=aboutagiletst01;AccountKey=VemAQ2wg2cKE7KNWHy8s3w5MJDZR/M3Li1mQ8XDNkvwLwO2YI6upMfALn2O+QuprHI+jVLodourOemI+nMPJ/w=='
var levelup = require('levelup');
var levelstore = require('redisdown');
var sublevel = require('level-sublevel');
var moment = require('moment');
var url = require('url');
var redis = require('redis');

function PlayerManagementService() {

    var levelDb = null;
    var teamsDb = null;

    // Sets up the database to default settings
    this.Open = function(db, leveldbArg) {
        if (db === null)
        {
			var redisURL = url.parse(process.env.REDISTOGO_URL);
			console.log('redisUrl = %s, Port = %s', redisURL.hostname, redisURL.port);
			var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
			console.log('Auth = %s', redisURL.auth);
			client.auth(redisURL.auth.split(":")[1]);
            
            var levelupdb = levelup(connection, {
                                    	valueEncoding: 'json',
                                        // the 'db' option replaces LevelDOWN
                                        db: levelstore, redis: client
                                    });
            levelDb = sublevel(levelupdb);
            teamsDb = levelDb.sublevel('teams');
            console.log('Fully connected');
        }
        else
        {
            //supporting the passing in of mocked database
            teamsDb = db;
            if (leveldbArg !== undefined)
                levelDb = leveldbArg;
        }
    }

    this.AddPlayer = function(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback) {
        
        if (isValidDate(dob, callback))
        {      
            console.log('a valid dob');  
            //check that the record does not exist anymore
            var key = keyMaker(teamname, firstname, surname);

			console.log('Does it exist?');

            //check that the record does not exist anymore
            teamsDb.get(key, function(err, value) {
                console.log('Check concluded');
                if (err && !err.notFound) {
                    levelDb.close();
                    callback(err, null);
                }
                else {
		            if (value) 
                    {
                       levelDb.close();
                       callback(new Error('Cannot add this player, the player already exists', null));
                    }
                    else
                    {
                    console.log('Put the row');
                        teamsDb.put(key, { dob: dob, address: address, suburb: suburb, postcode: postcode, phone: phone, email: email }, { sync: true }, 
					        function (err) {
                                levelDb.close();                                                                                                             
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
                    levelDb.close();
                    if (err)
                        callback(err);
                    else
                    {
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
                    if (err) 
                        callback(err);
                    else 
                        callback(null);
                });
             })
             .on('close', function() {
                levelDb.close();
             })
             .on('error', function(err) {
                 db.close();
                callback(err);      
             });
    }

    function keyMaker(teamname, firstname, surname)
    {
        return "".concat(teamname, "~", firstname, "~", surname, "~")
    }

    function isValidDate(d, callback) {
    
    	console.log('Checking the date %s', d);
    	
        var validDateFormats = ['DD MMM YYYY', 'D MMM YYYY', 'DD-MM-YYYY', 'D/MM/YYYY', 'D/M/YYYY', 'DD-MMM-YYYY'];

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