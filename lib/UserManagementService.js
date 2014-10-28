

function UserManagementService(db, users, crypt) {

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
    }
    
}

module.exports = UserManagementService;