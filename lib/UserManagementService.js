

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
    		        else
    		            callback(undefined, { firstname: value.firstname, surname: value.surname, email: name, loggedIn: true});
            	});
		    }
		      
    	});
    }
    
}

module.exports = UserManagementService;