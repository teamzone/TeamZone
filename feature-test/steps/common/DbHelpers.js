var bcrypt = require('bcrypt');
var assert = require('assert');

/// Using the back door to setup data for tests
function DbHelpers() {
    
    ///
    /// Helps create a user for the Feature Tests
    ///
    this.CreateUser = function(usersDb, createdUsers, firstname, surname, password, email, tokenHash, confirmed, callback) {
        
	    //Set up the fake user - maybe this is in the runner. Going direct? Use Regsiter API?  With the API we needn't bother with hash
	    
	    //direct code to DB
        bcrypt.genSalt(10, function(err, salt) {
            
            bcrypt.hash(password, salt, function(err, hashedPassword) {
                // Store hashed password in DB and token as well - token is used to keep the user alive as well as something the user sends back to verify identity
                usersDb.put(email, { firstname: firstname, surname: surname, email: email, password: hashedPassword, confirmed: confirmed, token: tokenHash }, { sync: true }, 
            				        function (err) {
            					        if (err) 
                                            callback(err);
                                        else {
                                            createdUsers[createdUsers.length] = {
                                                        email: email,
                                                        firstname: firstname,
                                                        surname: surname,
                                                        password: password,
                                                        confirmed: confirmed,
                                                        token: tokenHash
                                            };
                                            callback();
                                        }
            			            });	    
                
            });
        });
    };

    this.GetUser = function(usersDb, email, callback) {
	    //direct code to DB
        usersDb.get(email, function (err, res) {
			        if (err) 
                        callback(err);
                    else {
                        callback(null, res);
                    }
	    });	    
                
    };

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

    function checkforcompletion(context, userCount, done)
    {
        if (userCount === context.createdUsers.length - 1) {
         	if (context.database.redis)
         		context.database.redis.quit();
            context.database.leveldb.close();    
            if (done)
                done();
        }
    }

}

module.exports = DbHelpers;