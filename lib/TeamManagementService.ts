/// <reference path='../typings/tsd.d.ts' />

import tms = require('./ITeamManagementService');
var assert = require('assert');

export module Service {

	/*
	*  Implementation for Services for Team Management like like creating clubs and managing players within teams
	*  @class
	**/
	export class TeamManagementService implements tms.ITeamManagementService {

		/**
		* Accepts the components that support team management like the data store.  
		* @constructor
		* @param {clubdb} _clubs - The storage of teams to handled by this collaborator.
		**/
		constructor(private _clubs: any) {
		}

		/**
		* Will allow creation of the club.  Supplied parameters are mandatory.  
		* @param {string} clubname - the name of the club to be created.
		* @param {string} fieldname - the home field of the club.
		* @param {string} suburbname - the suburb of the home field and/or club.
		* @param {string} cityname - the name of the city the club plays in.
		* @param {string} adminemail - the email address of the main administrator of the club.  Usually the person creating the club.
		* @param {callback} callback - tell the caller if club created or there was a failure
		**/
		CreateClub = (clubname: string, fieldname: string, suburbname: string, cityname: string, adminemail: string, callback: any)  => {
			this.checkNotNullOrEmpty(clubname, 'clubname', callback);
			this.checkNotNullOrEmpty(fieldname, 'fieldname', callback);
			this.checkNotNullOrEmpty(suburbname, 'suburbname', callback);
			this.checkNotNullOrEmpty(cityname, 'cityname', callback);
			this.checkNotNullOrEmpty(adminemail, 'adminemail', callback);
			var clubs = this._clubs;
			var key = this.keyMaker(clubname, cityname);
	    	clubs.get(key, function(err, value) {
	    		if(err && err.notFound) {
					clubs.put(key, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }, function (err) {
						if (err) {
							callback(err);
						} else {
							callback();
						}
			    	});
	    		} else if (err) {
	    			callback(err);
			    } else {
			    	callback(new Error('Club in the same city cannot be created more than once'));
			    }
			});
		}
		
		/**
		 * Create the key value for the teams dataset
		 * @param {string} clubname - the club is the first part of the key
		 * @param {string} cityname - the city is the second part of the key
		 **/
		keyMaker(clubname: string, cityname: string) {
	        return "".concat(clubname, "~", cityname);
	    }

		/**
		 * Checked for null or empty strings
		 * @param {string} parametervalue - the value to check
		 * @param {string} parametername - the name of the value to check
		 * @param {callback} callback - will get called with the error if it exists
		 **/
	    checkNotNullOrEmpty(parametervalue: string, parametername: string, callback: any) {
	    	if (parametervalue === null || parametervalue.trim().length === 0) {
	    		callback(new Error('The argument ' + parametername + ' is a required argument'));
	    	}
	    }

	}
}
module.exports = Service.TeamManagementService;