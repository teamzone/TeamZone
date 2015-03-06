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
		* @param {clubdb} _clubs - The storage of clubs.
		* @param {_squadsdb} _squads - The storage of squads.
		**/
		constructor(private _clubs: any, private _squads: any) {
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
			this.checkEmailAddress(adminemail, 'The admin email is invalid', callback);
			var clubs = this._clubs;
			var key = this.clubKeyMaker(clubname, cityname);
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
		* Will allow creation of the squad.  Supplied parameters are mandatory.  
		* @param {string} clubname - the name of the club to be created (key).
		* @param {string} cityname - the name of the city the club plays in (key).
		* @param {string} squadname - the name of the squad (key)
		* @param {string} season - a name for the season the squad is playing in (key).  
		* 						   For example 2015, 2014/15 - this should map to a season dataset for further details about the season.
		* @param {string} admin - the email address of the main administrator of the squad.  Usually a coach.
		* @param {callback} callback - tell the caller if squad created or there was a failure
		**/
		CreateSquad = (clubname: string, cityname: string, squadname: string, season: string, agelimit: string, admin: string, callback: any)  => {
			this.checkNotNullOrEmpty(clubname, 'clubname', callback);
			this.checkNotNullOrEmpty(cityname, 'cityname', callback);
			this.checkNotNullOrEmpty(squadname, 'squadname', callback);
			this.checkNotNullOrEmpty(season, 'season', callback);
			this.checkNotNullOrEmpty(agelimit, 'agelimit', callback);
			this.checkNotNullOrEmpty(admin, 'admin', callback);
			this.checkEmailAddress(admin, 'The admin email is invalid', callback);
			var squads = this._squads;
			var key = this.squadKeyMaker(clubname, cityname, squadname, season);
	    	squads.get(key, function(err, value) {
	    		if(err && err.notFound) {
					squads.put(key, { agelimit: agelimit, admin: admin }, { sync: true }, function (err) {
						if (err) {
							callback(err);
						} else {
							callback();
						}
			    	});
	    		} else if (err) {
	    			callback(err);
			    } else {
			    	callback(new Error('Squad in the same club and season cannot be created more than once'));
			    }
			});
		}
		
		/**
		 * Create the key value for the clubs dataset
		 * @param {string} clubname - the club is the first part of the key
		 * @param {string} cityname - the city is the second part of the key
		 **/
		clubKeyMaker(clubname: string, cityname: string) {
	        return "".concat(clubname, "~", cityname);
	    }

		/**
		 * Create the key value for the squads dataset
		 * @param {string} clubname - the club is the first part of the key
		 * @param {string} cityname - the city is the second part of the key
		 * @param {string} squadname - the squad is the second part of the key
		 * @param {string} season - the season is the fourth part of the key
		 **/
		squadKeyMaker(clubname: string, cityname: string, squadname: string, season: string) {
			return this.clubKeyMaker(clubname, cityname) + '~'.concat(squadname, '~', season);
		}
		
		/**
		 * Checks for null or empty strings
		 * @param {string} parametervalue - the value to check
		 * @param {string} parametername - the name of the value to check
		 * @param {callback} callback - will get called with the error if it exists
		 **/
	    checkNotNullOrEmpty(parametervalue: string, parametername: string, callback: any) {
	    	if (parametervalue === null || parametervalue.trim().length === 0) {
	    		callback(new Error('The argument ' + parametername + ' is a required argument'));
	    	}
	    }
	    
	    /**
	     * Check validity of an email address
	     * @param {string} email - the address to check
	     * @param {string} invalidMessage - a message to include in an Error when email address is invalid
	     * @param {callback} callback - notification of an error in an email address
	     **/
	    checkEmailAddress(email: string, invalidMessage: string, callback: any) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		if (!re.test(email))
    			callback(new Error(invalidMessage));
	    }

	}
}
module.exports = Service.TeamManagementService;