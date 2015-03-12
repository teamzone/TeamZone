var bcrypt = require('bcrypt');
var assert = require('assert');

/*
*  Using the back door to access data in leveldb to perform checking in our feature tests.
*  We reason that whilst the code may look like production code and maybe we could use the front door approach, we think
*  that going directly to the database without any interceding logic that we can obtain a faster and more maintaibable test
*  infrastructue.  This means that this code will work provided our tests are solid with well formed test data that is designed
*  to work with this code.  When we do this we can avoid issues like fragile tests and minimize the chances of getting lost in the details
*  when attempting to fix problems that may arise.
*  We treat this code as first class and it has the same rights to be maintained as thoroughly as the production code it tests.  We hold this
*  principle in the highest utmost regard as we know that when we don't the cost to maintain our code base we become so onerous that we will
*  stop bothering.
*
*  Note: these are dumb - so repeating what was said earlier - don't expect any validation or any other logic other than create, retrieve and delete
*        in this class
*
*  @class
**/
function DbHelpers() {
    
	/**
	* Will allow creation of a user in the users database.    
	* @param {usersdb} usersdb - datastore for users.
	* @param {array} createdUsers - users created are stored so cleanup code can remove them in teardown of a test.
	* @param {string} firstname - firstname of the user.
	* @param {string} surname - the lastname/surname of the user.
	* @param {string} password - a password, any encryption is done by the caller!
	* @param {string} email - the email address to store for the user
	* @param {string} tokenHash - a token used to prevent spoofing
	* @param {boolean} confirmed - a flag when true means that the user has confirmed registration
	* @param {callback} callback - notify the caller of success or error
	**/
    this.CreateUser = function(usersDb, createdUsers, firstname, surname, password, email, tokenHash, confirmed, callback) {
        console.log('Test: Creating test user - %s', email);
	    //direct code to DB
        bcrypt.hash(password, 10, function(err, hashedPassword) {
            console.log('Test: Hashing password %s to - %s', password, hashedPassword);
            // Store hashed password in DB and token as well - token is used to keep the user alive as well as something the user sends back to verify identity
            usersDb.put(email, { firstname: firstname, surname: surname, email: email, password: hashedPassword, confirmed: confirmed, token: tokenHash }, { sync: true }, 
                        function (err) {
					        if (err) 
                                callback(err);
                            else {
                                console.log('Test: sample user %s was added', email);
                                createdUsers.push({
                                            email: email,
                                            firstname: firstname,
                                            surname: surname,
                                            password: password,
                                            confirmed: confirmed,
                                            token: tokenHash
                                });
                                callback();
                            }
			            });	    
            
        });
    };

	/**
	* Checks for a user ids (email address) in the array, returning true if found and false if not found or array is empty
	* Uses a simple linear search O(n) - for small lists which we assume is true most of the time this will be ok
	* If we find ourselves using a large list then use a Binary Search on a sorted list instead or consider using a hashed list
	* @param {array} users - the array containing the user ids.
	* @param {string} email - the id to look for
	* @returns {Boolean} true when found, false otherwise
	**/
    this.UserExistsInArray = function userExistsInArray(users, email) {
        if (users === undefined || users[0] === undefined)
            return false;
        var i = 0;
        while (i < users.length) { 
            if (users[i].email === email)
                return true;
            i++;
        }
        return false;
    };

	/**
	* Returns the user from database via email address
	* @param {usersdb} usersdb - datastore for users.
	* @param {string} email - the id to look for
	* @param {Retrieve~callback} callback - handles the response from leveldb
	**/
    this.GetUser = function(usersDb, email, callback) {
        usersDb.get(email, function (err, res) {
			        if (err) 
                        callback(err);
                    else 
                        callback(null, res);
	    });	    
    };

	/**
	* A utility function used from the feature tests to cycle through a list of users and delete them from
	* the database.  If at any point there is a failure an assert is thrown for that error and the test code
	* when then surely fail with hopefully enough information to aid in rectification of the problem.
	* @param {object} context - a javascript object containing properties for the database and the user array.
	* @param {Number} userCount - the total number of users to be deleted, used to check for completion
	* @param {Delete~callback} done - notify the caller when done
	**/
    this.RemoveUser = function(context, userCount, done) {
        var userEmail = context.createdUsers[userCount].email;
        console.log('Removing User %s', userEmail);
        context.usersDb.del(userEmail, { sync: true }, function(err) {
             if (err) {
                console.log('Error whilst deleting %s', userEmail);
                assert.ifError(err);
             }
             else
                checkforcompletion(context, userCount, done);
        });
    };

	/**
	* Returns a club object from database via clubname and cityname.  These are keys as we expect
	* a club cannot exist more than once in the same city
	* @param {clubsdb} clubsdb - datastore for clubs.
	* @param {string} clubname - first part of the key
	* @param {string} cityname - second part of the key
	* @param {Retrieve~callback} callback - handles the response from leveldb
	**/
    this.GetClub = function(clubsdb, clubname, cityname, callback) {
        clubsdb.get(clubname + '~' + cityname, function (err, res) {
			        if (err) 
                        callback(err);
                    else 
                        callback(null, res);
	    });	    
    };

	/**
	* Creates a club in the datastore.  
	* @param {clubsdb} clubsdb - datastore for clubs.
	* @param {string} clubname - first part of the key
	* @param {string} cityname - second part of the key
	* @param {string} fieldname - the main ground it plays at
    * @param {string} suburbname - the suburb in which it plays
	* @param {string} adminemail - the administrator of the club
	* @param {Retrieve~callback} callback - handles the response from leveldb
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.CreateClub = function(clubsdb, createdClubs, clubname, cityname, fieldname, suburbname, adminemail, callback, callbackCalledOnSuccess) {
        clubsdb.put(clubname + '~' + cityname, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }, 
            function (err) {
		        if (err) 
                    callback(err);
                else {
                    console.log('Test: sample club %s in city %s was added', clubname, cityname);
                    createdClubs.push({
                                club: clubname,
                                city: cityname,
                                field: fieldname,
                                suburb: suburbname,
                                admin: adminemail
                    });
                    if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                        callback();
                    else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                        console.log('No need to do the callback');
                    else
                        callback();
                }
            });	    
    };
    
	/**
	* Creates a club in the datastore.  
	* @param {clubsdb} clubsdb - datastore for clubs.
	* @param {array} createdPlayers - array used to keep track of created players and used later to aid with cleanup
	* @param {string} email - email address of the player and the key
	* @param {string} firstname - Player's first name
	* @param {string} surname - Player's last name
    * @param {string} DOB - Player's date of birth
	* @param {string} address - Player's residential address
	* @param {string} suburb - Player's residential suburb
	* @param {string} postcode - Player's residential postcode
	* @param {string} phone - Player's residential phone number, could be the mobile number
	* @param {Retrieve~callback} callback - handles the response from leveldb
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.CreatePlayer = function(playersdb, createdPlayers, email, firstname, surname, DOB, address, suburb, postcode, phone, callback, callbackCalledOnSuccess) {
        playersdb.put(email, { dob: DOB, address: address, suburb: suburb, postcode: postcode, phone: phone }, { sync: true }, 
            function (err) {
		        if (err) 
                    callback(err);
                else {
                    console.log('Test: sample player %s was added', email);
                    createdPlayers.push({
                                email: email,
                                dob: DOB, 
                                address: address, 
                                suburb: suburb, 
                                postcode: postcode, 
                                phone: phone
                    });
                    if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                        callback();
                    else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                        console.log('No need to do the callback');
                    else
                        callback();
                }
            });	    
    };
    
	/**
	* Removes a club from the datastore.  
	* @param {string} clubname - first part of the key
	* @param {string} cityname - second part of the key 
	* @param {Delete~callback} callback - notify the caller when done
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.RemoveClub = function(clubsdb, clubname, cityname, callback, callbackCalledOnSuccess) {
        console.log('Removing club %s in city %s', clubname, cityname);
        assert(clubsdb, 'Missing the clubsdb');
        assert(clubname, 'Missing the clubname');
        assert(cityname, 'Missing the cityname');
        clubsdb.del(clubname + '~' + cityname, { sync: true }, function(err) {
             if (err) {
                console.log('Error whilst deleting %s', clubname);
                callback(err);
             }
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                callback();
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                console.log('No need to do the callback');
             else
                callback();
        });
    };

	/**
	* Creates a squad, linked to a club, in the datastore.  
	* @param {squadsdb} squadsdb - datastore for squads. It exists under clubs
	* @param {string} clubname - name of the club used for information
	* @param {string} cityname - name of the city the club is in and used for information
	* @param {string} squadname - name of the squad and part of the key
    * @param {string} season - the identifier for the season the squad plays in and part of the key
    * @param {string} agelimit - used to help limit eligibility to play in the squad
	* @param {string} adminemail - the administrator of the club
	* @param {Retrieve~callback} callback - handles the response from leveldb
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.CreateSquad = function(squadsdb, createdSquads, clubname, cityname, squadname, season, agelimit, adminemail, callback, callbackCalledOnSuccess) {
        assert(squadsdb, 'Missing the squadsdb');
        assert(squadname, 'Missing the squadname');
        assert(season, 'Missing the season');
        squadsdb.put(squadname + '~' + season, { agelimit: agelimit, admin: adminemail }, { sync: true }, 
            function (err) {
		        if (err) 
                    callback(err);
                else {
                    console.log('Test: sample squad %s was added', squadname);
                    createdSquads.push({
                                club: clubname,
                                city: cityname,
                                squad: squadname,
                                season: season,
                                agelimit: agelimit,
                                admin: adminemail
                    });
                    if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                        callback();
                    else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                        console.log('No need to do the callback');
                    else
                        callback();
                }
            });	    
    };

	/**
	* Returns a squad object from database via clubname and cityname.  These are keys as we expect
	* a club cannot exist more than once in the same city
	* @param {squadsDb} squadsDb - datastore for squads.
	* @param {string} clubname - first part of the key
	* @param {string} cityname - second part of the key
	* @param {string} squadname - third part of the key
	* @param {string} season - fourth part of the key
	* @param {Retrieve~callback} callback - handles the response from leveldb
	**/
    this.GetSquad = function(squadsDb, clubname, cityname, squadname, season, callback) {
        squadsDb.get(squadname + '~' + season, function (err, res) {
	        if (err) 
                callback(err);
            else 
                callback(null, res); //easy via a stub to fool this into being correct - does it matter - the key would have already been supplied so the data is there!
	    });	    
    };

	/**
	* Removes a squad from the datastore. 
	* @param {squadsDb} squadsDb - the datastore to be removing from
	* @param {string} clubname - first part of the key
	* @param {string} cityname - second part of the key
    * @param {string} squadname - third part of the key  
    * @param {string} season - fourth part of the key  
	* @param {Delete~callback} callback - notify the caller when done
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.RemoveSquad = function(squadsDb, clubname, cityname, squadname, season, callback, callbackCalledOnSuccess) {
        console.log('Removing squad %s for season %s in the club %s in the city %s', squadname, season, clubname, cityname);
        squadsDb.del(squadname + '~' + season, { sync: true }, function(err) {
             if (err) {
                console.log('Error whilst deleting %s', squadname);
                callback(err);
             }
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                callback();
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                console.log('No need to do the callback');
             else
                callback();
        });
    };

	/**
	* Removes a squad player from the datastore.  
	* @param {squadPlayersDb} squadPlayersDb - the datastore to be removing from
    * @param {string} squadname - first part of the key, the squad the player is playing in  
    * @param {string} season - secobnd part of the key, the season the player is playing in  
    * @param {string} email - third part of the key, the player's email
	* @param {Delete~callback} callback - notify the caller when done
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.RemoveSquadPlayer = function(squadPlayersDb, squadname, season, email, callback, callbackCalledOnSuccess) {
        console.log('Removing player %s from squad %s for season %s', email, squadname, season);
        squadPlayersDb.del(squadname + '~' + season + '~' + email, { sync: true }, function(err) {
             if (err) {
                console.log('Error whilst deleting %s', email);
                callback(err);
             }
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                callback();
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                console.log('No need to do the callback');
             else
                callback();
        });
    };

	/**
	* Removes a squad from the datastore.  
	* @param {string} clubname - first part of the key
	* @param {callback} callback - notify the caller when done
	* @param {Boolean} callbackCalledOnSuccess - when set and set to false then the callback should not be called on success
	*                                            because it probably part of bigger workflow.
	**/
    this.RemovePlayer = function(playersDb, email, callback, callbackCalledOnSuccess) {
        console.log('Removing player with email address: %s', email);
        playersDb.del(email, { sync: true }, function(err) {
             if (err) 
                callback(err);
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess !== false)
                callback();
             else if (!callbackCalledOnSuccess && callbackCalledOnSuccess === false)
                console.log('No need to do the callback');
             else
                callback();
        });
    };

	/**
	* Removes all entities found in the arrays from the datastores.  
	* @param {object} dbs - contains references to datastore objects.
	* @param {createdPlayers} - array of players to remove. Can be undefined, which means it's skipped.
	* @param {createdSquads} - array of squads to remove.  Can be undefined, which means it's skipped.
	* @param {createdSquadPlayers} - array of squad players to remove. Can be undefined, which means it's skipped.
	* @param {createdClubs} - array of clubs to remove. Can be undefined, which means it's skipped.
	* @param {createdUsers} - array of users to remove. Can be undefined, which means it's skipped.
	* @param {callback} callback - notify the caller when done
	**/
    this.CascadeDelete = function(dbs, createdPlayers, createdSquads, createdSquadPlayers, createdClubs, createdUsers, callback) {

        if (createdSquadPlayers)
            for (var i = 0; i < createdSquadPlayers.length; i++) 
                this.RemoveSquadPlayer(dbs.squadPlayersDb, createdSquadPlayers[i].squadname, createdSquadPlayers[i].season, createdSquadPlayers[i].email, callback, false);

        if (createdPlayers)
            for (var i = 0; i < createdPlayers.length; i++) 
                this.RemovePlayer(dbs.playersDb, createdPlayers[i].email, callback, false);
    
        if (createdSquads)
            for (var i = 0; i < createdSquads.length; i++) 
                this.RemoveSquad(dbs.squadsDb, createdSquads[i].clubname, createdSquads[i].cityname, createdSquads[i].squadname, createdSquads[i].season, callback, false);

        if (createdClubs)            
            for (var i = 0; i < createdClubs.length; i++) 
                this.RemoveClub(dbs.clubsDb, createdClubs[i].club, createdClubs[i].city, callback, false);

        if (dbs && dbs.usersDb && createdUsers) {
            var context = { createdUsers: createdUsers, usersDb: dbs.usersDb };
            for (var i = 0; i < createdUsers.length; i++) 
                this.RemoveUser(context, i, callback);
        }
    };
    
	/**
	* Checks for completion of removal of users and then closes down the database, releasing resources that it may hold
	* @param {object} context - passed in from the caller with properties for created users.
	* @param {string} userCount - help to check for completion of the removal
	* @param {callback} done - notify the caller of completion - when the parameter is supplied
	**/
    function checkforcompletion(context, userCount, done)
    {
        if (userCount === context.createdUsers.length - 1) {
         	if (context.database && context.database.redis)
         		context.database.redis.quit();
            if (context.database) 
                context.database.leveldb.close();    
            if (done)
                done();
        }
    }

/**
 * A generic callback for any retrieval function for leveldb.
 * @callback Retrieve~callback
 * @param {Error} populated with an a standard Error object when there is a failure with leveldb
 * @param {any} the contents of the database returned as is.  It will most likely be a JSON formatted object
 */
 
/**
 * A generic callback for any delete function for leveldb.
 * @callback Delete~callback
 * @param {Error} populated with an a standard Error object when there is a failure with leveldb
 */
}

module.exports = DbHelpers;