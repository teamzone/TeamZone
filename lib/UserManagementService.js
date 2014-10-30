

function UserManagementService(users, crypt) {

    this.LoginUser = function(name, password, callback) {
    	
		users.get(name, function (err, value) {
			if (err) {
		        callback(err);
		    }
		    else {
    		    crypt.compare(password, value.password, function(err, res) {
    		    	
    		        if(err) 
    	                callback(err);
    	            else if (res)
    		            callback(undefined, { firstname: value.firstname, surname: value.surname, email: name, loggedIn: true});
    		        else
    		        	callback(new Error('Incorrect Login Details Entered, please check your email and/or password'));
            	});
		    }
		      
    	});
    };
    
    this.RegisterUser = function(email, password, callback) {
    	users.get(email, function(err, value) {
    		if(err && err.notFound) {
    			crypt.hash(password, 10, function(err, hash) {
    				if(err)
    					callback(err);
    				else
    					users.put(email, { password: hash, email: email }, callback);
    			});
    		} else if (err) {
    			callback(err);
    		} else {
    			callback(new Error("User already exists"));
    		}
    	});
    };
    
}

module.exports = UserManagementService;