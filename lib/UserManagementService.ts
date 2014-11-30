/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/bcrypt/bcrypt.d.ts' />

module Service {
//////////////////////////////////////////////////////
/// Services for User Management
//////////////////////////////////////////////////////
	export interface IUserManagementService {
	  LoginUser(name: string, password: string, callback: any);
	  RegisterUser(email: string, password: string, callback: any);
	  ConfirmRegisterUser(email: string, token: string, callback);
	}
	
	export class UserManagementService implements IUserManagementService {
		private users: any;
		private crypt: any;
		private tokenizer: any;
		private emailsender: any;
		
		constructor(users: any, crypt: any, tokenizer: any, emailsender: any) {
			this.users = users;
			this.crypt = crypt;
			this.tokenizer = tokenizer;
			this.emailsender = emailsender;
		}
	    
	    LoginUser = (name: string, password: string, callback: any) => {
	    
	    	//workaround for embedded module variables in callbacks within typescript
	    	var crypt = this.crypt;
	    	
				this.users.get(name, function (err, value) {
					if (err) {
				        callback(err);
				    }
				    else {
				        if (!value.confirmed)
				            callback(new Error('User has yet to be confirmed'));
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
				    }
		    	});
	    }
	    
	    RegisterUser = (email: string, password: string, callback) => {
	    	
	    	//workaround for embedded module variables in callbacks within typescript
	    	var crypt = this.crypt;
	    	var tokenizer = this.tokenizer;
	    	var users = this.users;
	    	var emailsender = this.emailsender;
	    	
	    	users.get(email, function(err, value) {
	    		if(err && err.notFound) {
	    			crypt.hash(password, 10, function(err, hash) {
	    				if(err)
	    					callback(err);
	    				else
	    				{
	    					users.put(email, { password: hash, email: email, token: tokenizer.generate(email) }, function(err) {
	    					    if (err)
	    					        callback(err)
	    					    else {
	    					        emailsender.send(email, function(err) {
	    					            if (err)
	    					                callback(new Error('Failed to send the verification email'))
	    					            else
	    					                callback();
	    					        });
	    					    }
	    					});
	    				}
	    			});
	    		} else if (err) {
	    			callback(err);
	    		} else {
	    			callback(new Error("User already exists"));
	    		}
	    	});
	    }
	    
	    ConfirmRegisterUser = (email: string, token: string, callback) => {
	    	
	    	//workaround for embedded module variables in callbacks within typescript
	    	var tokenizer = this.tokenizer;
	    	var users = this.users;
	    	
	    	users.get(email, function(err, value) {
	    		if (err && err.notFound) 
	    			callback(new Error('The user ' + email + ' is not present in the database'));
	    		else if (err)
	    			callback(new Error('A failure occurred trying to retrieve details for ' + email));
	    		else if (tokenizer.verify(email, token)) {
	    			users.put(email, { password: value.password, email: email, token: token, confirmed: true }, function(err) {
	    				if (err)
	    					callback(new Error('A failure occurred trying to save confirmation for ' + email));
	    				else
	    					callback();
	    			});
	    		}
	    	});
	    }
	    
	}
}
module.exports = Service.UserManagementService;