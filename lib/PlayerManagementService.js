/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
"use strict";

var moment = require('moment');

function PlayerManagementService() {

    var playerDb,
        levelDb;
    
    // Sets up the database to default settings
    this.Open = function (db, leveldbArg) {
        //supporting the passing in of mocked database
        playerDb = db;
        if (leveldbArg !== undefined)
            levelDb = leveldbArg;
    };

    this.AddPlayer = function(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback) {
        
        if (isValidDate(dob, callback)) {      
            //check that the record does not exist anymore
            var key = keyMaker(teamname, firstname, surname);

			//check that the record does not exist anymore
            playerDb.get(key, function(err, value) {
                
                if (err && !err.notFound) {
                    callback(err, null);
                } else {
		            if (value) {
                       callback(new Error('Cannot add this player, the player already exists', null));
                    } else {
                        playerDb.put(key, { dob: dob, address: address, suburb: suburb, postcode: postcode, phone: phone, email: email }, { sync: true }, 
					        function (err) {
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
		playerDb.get(keyMaker(teamname, firstname, surname), function (err, value) { 
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
        playerDb.createKeyStream()
            .on('data', function(keyValue) {
                playerDb.del(keyValue, { sync: true }, function (err) {
                    if (err) {
                        callback(err);
                    }
                    return;
                });
             })
             .on('close', function() {
             	callback();
             })
             .on('error', function(err) {
                callback(err);      
             });
    };

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