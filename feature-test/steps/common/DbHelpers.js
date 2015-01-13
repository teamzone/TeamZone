var bcrypt = require('bcrypt');
var assert = require('assert');

/// Using the back door to setup data for tests
function DbHelpers() {
    
    ///
    /// Helps create a user for the Feature Tests
    ///
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
    }

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