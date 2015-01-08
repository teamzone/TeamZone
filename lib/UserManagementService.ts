/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/bcrypt/bcrypt.d.ts' />

import ums = require('./IUserManagementService');
var assert = require('assert');

export module Service {

	/*
	*  Implementation for Services for User Management like registering and logging in users
	*  @class
	**/
	export class UserManagementService implements ums.IUserManagementService {

		/**
		* Accepts the components that support user management like the data store, cryptography and emailing.  
		* @constructor
		* @param {usersdb} _users - The storage of users to handled by this collaborator.
		* @param {bcrypt} _crypt - this library provided the hashing of passwords to keep them safe.
		* @param {tokenizer} _tokenizer - used for registering to provide a unique token for new users, mitigate against spoof attacks
		* @param {emailsender} _emailsender - this collaborator will send the confirmation email to a new user.
		**/
		constructor(private _users: any, private _crypt: any, private _tokenizer: any, private _emailsender: any) {
		}

		/**
		* Will check the credentials for existence and permit logging if correct  
		* @param {string} email - the email of the logging in user.  It will be unique so is the key.
		* @param {string} password - a password for the logging in user.
		* @param {callback} callback - tell the caller if logged in or there was a failure
		**/
	    LoginUser = (email: string, password: string, callback: any) => {
	    
	    	//workaround for embedded module variables in callbacks within typescript
	    	var crypt = this._crypt;
			this._users.get(email, function (err, value) {
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
	        		            callback(undefined, { firstname: value.firstname, surname: value.surname, email: email, loggedIn: true});
	        		        else
	        		        	callback(new Error('Incorrect Login Details Entered, please check your email and/or password'));
	            	    });
			        }
			    }
	    	});
	    }

		/**
		* Will register a new user if the user doesn't a;ready exist.  
		* @param {string} email - the unique email of the registering user. 
		* @param {string} password - a password for the logging in user.
		* @param {callback} callback - tell the caller if registered successfully or there was a failure
		**/
	    RegisterUser = (email: string, password: string, callback) => {
	    	
	    	//workaround for embedded module variables in callbacks within typescript - to much nesting and this doesn't work
	    	var crypt = this._crypt;
	    	var tokenizer = this._tokenizer;
	    	var users = this._users;
	    	var emailsender = this._emailsender;
	    	
	    	users.get(email, function(err, value) {
	    		if(err && err.notFound) {
	    			crypt.hash(password, 10, function(err, hash) {
	    				if(err)
	    					callback(err);
	    				else {
	    					var token: string;
	    					try {
	    						token = tokenizer.generate(email);
	    					} catch (err) {
	    						callback(new Error('An error occured generating the unique user token ' + err.message));
	    						return;
	    					}
	    					users.put(email, { password: hash, email: email, token: token }, function(err) {
	    					    if (err)
	    					        callback(err);
	    					    else {
	    					        emailsender.send(email, token, function(err) {
	    					            if (err) {
								    		users.del(email, { sync: true }, function (err) {
							                    if (err) 
							                        callback(new Error('Failed to send the verification email and rolling back on the user failed as well.'));
							                    else
		    					                	callback(new Error('Failed to send the verification email'));
							                });
	    					            } else {
	    					                callback();
	    					            }
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
	    
		/**
		* Will confirm the registration a new user which would have been enacted when the user clicks on the confirm registration link sent by RegisterUsers.  
		* @param {string} email - the email of the logging in user. 
		* @param {string} token - the unique token created by RegisterUser that ensures we don't have any spoofing.
		* @param {callback} callback - tell the caller if confirmation occured successfully or there was a failure
		**/
	    ConfirmRegisterUser = (email: string, token: string, callback) => {
	    	
	    	//workaround for embedded module variables in callbacks within typescript
	    	var tokenizer = this._tokenizer;
	    	var users = this._users;
	    	
	    	users.get(email, function(err, value) {
	    		if (err && err.notFound) 
	    			callback(new Error('The user ' + email + ' is not present in the database'));
	    		else if (err)
	    			callback(new Error('A failure occurred trying to retrieve details for ' + email));
	    			
	    		else {
	    			var isValidToken: boolean = false; 
	    			try {
	    				console.log('verifying email: %s and token %s.', email, token);
	    				console.log('The stored token is %s', value.token);
	    				isValidToken = tokenizer.verify(email, token);
	    			} catch (err) {
	    				callback(new Error('Confirmation token has failed validation. Appears an error occurred.'));
	    				return;
	    			}
	    			if (isValidToken) {
	    				if (value.token !== token)
	    					callback(new Error('Confirmation token has failed validation. It has changed from the stored value.'));
	    				else
		    				users.put(email, { password: value.password, email: email, token: token, confirmed: true }, function(err) {
		    					if (err)
		    						callback(new Error('A failure occurred trying to save confirmation for ' + email));
		    					else
		    						callback();
		    				});
	    			}
	    			else {
	    				callback(new Error('Confirmation token has failed validation. It may have been modified.'));
	    			}
	    		}
	    	});
		}
	}
}
module.exports = Service.UserManagementService;