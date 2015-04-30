/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';

import tms = require('./ITeamManagementService');
import assert = require('assert');
import _ = require('underscore');
var createError = require('errno').create;
var AgeLimitError = createError('AgeLimitError');

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
		* @param {squadsdb} _squads - The storage of squads.
		* @param {playersdb} _players - The storage of players.
		* @param (squadplayers) _squadplayers - The storage that links players to a squad 
		**/
		constructor(private _clubs: any, private _squads: any, private _players: any, private _squadplayers: any) {
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
	    	clubs.get(key, function(err) {
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
		* @param {string} clubname - the name of the club to be created (key), notionally used as squads are created under clubs anyway.
		* @param {string} cityname - the name of the city the club plays in (key), notionally used as squads are created under clubs anyway.
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
	    	squads.get(key, function(err) {
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
		* Add a player to a squad. 
		* @param {string} clubname - the name of the club (key) - we need to relate back to the club to find the true squad
		* @param {string} cityname - the name of the city the club is in (key) - we need to relate back to the club to find the true squad
		* @param {string} squadname - the name of the squad (key)
		* @param {string} season - a name for the season the squad is playing in (key).  
		* 						   For example 2015, 2014/15 - this should map to a season dataset for further details about the season.
		* @param {string} playeremail - the email address of the player which will link to players under a club
		* @param {callback} callback - tell the caller if squad created or there was a failure
		* @param {number} targetyear - optionally specified over the current year for the player age check
		**/
		AddPlayerToSquad = (clubname: string, cityname: string, squadname: string, season: string, playeremail: string, callback: any, targetyear?: number)  => {
			var squadplayers = this._squadplayers;

			this.checkNotNullOrEmpty(clubname, 'clubname', callback);
			this.checkNotNullOrEmpty(cityname, 'cityname', callback);
			this.checkNotNullOrEmpty(squadname, 'squadname', callback);
			this.checkNotNullOrEmpty(season, 'season', callback);
			this.checkNotNullOrEmpty(playeremail, 'playeremail', callback);
			this.checkEmailAddress(playeremail, 'The player email is invalid', callback);
			this.checkPlayerAge(playeremail, clubname, cityname, squadname, season, function(err) {
				if (err)
					callback(err);
				else {
					var key = clubname + '~' + cityname + '~' + squadname + '~' + season + '~' + playeremail;
			    	squadplayers.get(key, function(err) {
			    		if(err && err.notFound) {
							squadplayers.put(key, { playeremail: playeremail }, { sync: true }, function (err) {
								if (err) 
									callback(err);
								else 
									callback();
					    	});
			    		} else if (err) 
			    			callback(err);
					    else 
					    	callback(new Error('Cannot add the same player twice to a squad'));
			    	});
				}
			});
		}

		/**
		* Returns a list of all the players for a club/city pair
		* 
		* @param {string} clubname - the name of the club (key)
		* @param {string} cityname - the name of the city the club is in (key)
		* @param {callback} callback - tell the caller if squad created or there was a failure
		**/
		GetPlayersForClub = (clubname: string, cityname: string, callback: any) => {
	        var players = [];
	        this._players.createReadStream(this.clubKeyMaker(clubname, cityname))
	            .on('data', function(player) {
	                players.push(player);
	            })
	            .on('end', function() {
	                callback(null, players);
	            })
	            .on('error', function(err){
	                callback(err);
	            });
		}

		/**
		* Returns a list of all the players for a club/city pair that aren't yet in the squad for a season
		* 
		* @param {string} clubname - the name of the club (key)
		* @param {string} cityname - the name of the city the club is in (key)
		* @param {string} squadname - the name of the squad to be checked against
		* @param {string} season - the identifier for a season to be checked against (along with the squadname)
		* @param {callback} callback - tell the caller if squad created or there was a failure
		**/
		GetPlayersForClubNotInSquad = (clubname: string, cityname: string, squadname: string, season: string, callback: any) => {
			var playersdb = this._players;
			var clubKey = this.clubKeyMaker(clubname, cityname);
			this.GetPlayersForSquad(clubname, cityname, squadname, season, function(err, squadplayers) {
				if (err) {
					callback(err)
				} else {
			        var players = [];
			        playersdb.createReadStream({ gte: clubKey })
			            .on('data', function(player) {
			            	if (!_.find(squadplayers, function(s: any) { return s.email === player.email; })) {
			                	players.push(player);
			            	}
			            })
			            .on('end', function() {
			                callback(null, players);
			            })
			            .on('error', function(err){
			                callback(err);
			            });
				}
			});
		}

		/**
		* Returns a list of all the players for a club/city pair
		* 
		* @param {string} squadname - the name of the squad (key)
		* @param {string} season - a name for the season the squad is playing in (key).  
		* 						   For example 2015, 2014/15 - this should map to a season dataset for further details about the season.
		* @param {callback} callback - tell the caller if squad created or there was a failure
		**/
		GetPlayersForSquad = (clubname: string, cityname: string, squadname: string, season: string, callback: any)  => {
	        var players = [];
	        this._squadplayers.createReadStream(this.squadKeyMaker(clubname, cityname, squadname, season))
	            .on('data', function(player) {
	                players.push(player);
	            })
	            .on('end', function() {
	                callback(null, players);
	            })
	            .on('error', function(err){
	                callback(err);
	            });
		}
		
		/**
		 * Create the key value for the clubs dataset
		 * @param {string} clubname - the club is the first part of the key
		 * @param {string} cityname - the city is the second part of the key
		 **/
		clubKeyMaker(clubname: string, cityname: string) : string {
	        return "".concat(clubname, "~", cityname);
	    }

		/**
		 * Create the key value for the squads dataset
		 * @param {string} clubname - the club is the first part of the key
		 * @param {string} cityname - the city is the second part of the key
		 * @param {string} squadname - the squad is the second part of the key
		 * @param {string} season - the season is the fourth part of the key
		 **/
		squadKeyMaker(clubname: string, cityname: string, squadname: string, season: string) : string {
			return this.clubKeyMaker(clubname, cityname).concat('~', squadname, '~', season);
		}
		
		/**
		 * Checks for null or empty strings
		 * @param {string} parametervalue - the value to check
		 * @param {string} parametername - the name of the value to check
		 * @param {callback} callback - will get called with the error if it exists
		 **/
	    checkNotNullOrEmpty(parametervalue: string, parametername: string, callback: any) {
	    	if (parametervalue === undefined || parametervalue === null || parametervalue.trim().length === 0) {
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

	    /**
	     * Check the player is eligible to play for the team by checking the age requirement
	     * @param {string} playeremail - the email address of the player which can be used to get player details involved in the checking
		 * @param {string} clubname - use to get squad details to enable checking of details of the squad
		 * @param {string} cityname - use to get squad details to enable checking of details of the squad
	     * @param {string} squadname - use to get squad details to enable checking of details of the squad
	     * @param {string} season - use to get squad details to enable checking of details of the squad
	     * @param {callback} callback - notification of error or success
		 * @param {number} targetyear - optionally specified over the current year for the player age check
	     **/
		checkPlayerAge(playeremail: string, clubname: string, cityname: string, squadname: string, season: string, callback: any, targetyear?: number) {
			//get player details from playerdb
			var squads = this._squads;
			var squadkey = this.squadKeyMaker(clubname, cityname, squadname, season);
			this._players.get(clubname + '~' + cityname + '~' + playeremail, function(err, playervalue) {
				if (err) 
					callback(err);
				else {
					squads.get(squadkey, function(err, squadvalue) {
						if (err)
							callback(err);
						else {
							var prefix = 'over';
							//when a player's age at the start of the year the season is in is less than an over value they get rejected
							//seasons can be any notation that the user wishes to describe, so this makes the assumption using the current
							//date and taking the start of the year for the current date - unless specified in the target year
							if (!targetyear)
								targetyear = new Date(Date.now()).getFullYear();
							var playerdob  = new Date(playervalue.dob);
							var playerage = targetyear - playerdob.getFullYear();
							if (squadvalue.agelimit.substring(0, prefix.length) === prefix) {
								var ageLimitYears = Number(squadvalue.agelimit.substring(prefix.length).trim());
								if (playerage < ageLimitYears) {
									callback(new AgeLimitError('Player does not qualify for the squad due to being underaged'));
									return;
								}
							} else {
								prefix = 'under';
								if (squadvalue.agelimit.substring(0, prefix.length) === prefix) {
									var ageLimitYears = Number(squadvalue.agelimit.substring(prefix.length).trim());
									if (playerage > ageLimitYears) {
										callback(new AgeLimitError('Player does not qualify for the squad due to being over age'));
										return;
									}
								}
							}
						}
						callback();
					});
				} 
			});
		}
	}
}
module.exports = Service.TeamManagementService;