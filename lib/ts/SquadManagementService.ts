/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';

import sms = require('./ISquadManagementService');
import servicebase = require('./ServiceBase');
import kf = require('./KeyFactory');
import assert = require('assert');
import _ = require('underscore');
var errTo = require('errto');
var createError = require('errno').create;
var AgeLimitError = createError('AgeLimitError');

export module Service {

	/*
	*  Implementation for Services for Squad Management like like creating squads for players to be added to
	*  @class
	**/
	export class SquadManagementService 
		extends servicebase.Service.ServiceBase
		implements sms.ISquadManagementService {

		/**
		* Accepts the components that support team management like the data store.  
		* @constructor
		* @param {squadsdb} _squads - The storage of squads.
		* @param {playersdb} _players - The storage of players.
		* @param (squadplayers) _squadplayers - The storage that links players to a squad 
		**/
		constructor(private _squads: any, private _players: any, private _squadplayers: any) {
			super();
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
		CreateSquad = (clubname: string, cityname: string, squadname: string, season: string, agelimit: string, admin: string, callback: any) => {
			var key = kf.KeyFactory.squadKeyMaker(clubname, cityname, squadname, season);
			var squads = this._squads;
			super.validateParameters(this.validationParametersForCreatingSquad(clubname, cityname, squadname, season, agelimit, admin), errTo(callback, function() {
		    	squads.get(key, function(err) {
		    		if(err && err.notFound) {
						squads.put(key, { agelimit: agelimit, admin: admin }, { sync: true },  errTo(callback, callback));
		    		} else if (err) {
		    			callback(err);
				    } else {
				    	callback(new Error('Squad in the same club and season cannot be created more than once'));
				    }
				});
			}));
		}

		/**
		* Supplies an array parameter values and their names and links to the validations required for these parameters
		* @param {string} clubname - the name of the club to be created (key), notionally used as squads are created under clubs anyway.
		* @param {string} cityname - the name of the city the club plays in (key), notionally used as squads are created under clubs anyway.
		* @param {string} squadname - the name of the squad (key)
		* @param {string} season - a name for the season the squad is playing in (key).  
		* @param {string} admin - the email address of the main administrator of the squad.  Usually a coach.
		**/
		validationParametersForCreatingSquad(clubname: string, cityname: string, squadname: string, season: string, agelimit: string, admin: string) : any {
			return [ 
				{ name: 'clubname', content: clubname, validations: [ this.checkNotNullOrEmpty ] }, { name: 'squadname', content: squadname, validations: [ this.checkNotNullOrEmpty ] },
				{ name: 'cityname', content: cityname, validations: [ this.checkNotNullOrEmpty ] },
			  	{ name: 'season', content: season, validations: [ this.checkNotNullOrEmpty ] }, { name: 'agelimit', content: agelimit, validations: [ this.checkNotNullOrEmpty ] }, 
			  	{ name: 'admin', content: admin, validations: [ this.checkNotNullOrEmpty, { v: this.checkEmailAddress, m: 'The admin email is invalid' } ] }
			];
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
			var squadkey = kf.KeyFactory.squadKeyMaker(clubname, cityname, squadname, season);
			this.validatePlayerForSquadParameters(clubname, cityname, squadname, season, playeremail, targetyear, squadkey, errTo(callback, function() {
				var key = squadkey + '~' + playeremail;
		    	squadplayers.get(key, function(err) {
		    		if(err && err.notFound) {
						squadplayers.put(key, { playeremail: playeremail }, { sync: true }, errTo(callback, callback));
		    		} else if (err) 
		    			callback(err);
				    else 
				    	callback(new Error('Cannot add the same player twice to a squad'));
		    	});
			}));
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
			var clubKey = kf.KeyFactory.clubKeyMaker(clubname, cityname);
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
	        this._squadplayers.createReadStream(kf.KeyFactory.squadKeyMaker(clubname, cityname, squadname, season))
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
		* Does all the validation required for adding a player to a squad which includes checking the parameters and checking the age against the squad limit
		* 
		* @param {string} clubname - the name of the club (key) - we need to relate back to the club to find the true squad
		* @param {string} cityname - the name of the city the club is in (key) - we need to relate back to the club to find the true squad
		* @param {string} squadname - the name of the squad (key)
		* @param {string} season - a name for the season the squad is playing in (key).  
		* 						   For example 2015, 2014/15 - this should map to a season dataset for further details about the season.
		* @param {string} playeremail - the email address of the player which will link to players under a club
		* @param {number} targetyear - specified over the current year for the player age check
 		* @param {callback} callback - tell the caller if squad created or there was a failure
		**/
		validatePlayerForSquadParameters(clubname: string, cityname: string, squadname: string, season: string, playeremail: string, targetyear: number, squadkey: string, callback: any) {
			var thismodule = this;
			thismodule.checkNotNullOrEmpty(clubname, 'clubname', errTo(callback, function() {
				thismodule.checkNotNullOrEmpty(cityname, 'cityname', errTo(callback, function() {
					thismodule.checkNotNullOrEmpty(squadname, 'squadname', errTo(callback, function() {
						thismodule.checkNotNullOrEmpty(season, 'season', errTo(callback, function() {
							thismodule.checkNotNullOrEmpty(playeremail, 'playeremail', errTo(callback, function() {
								thismodule.checkEmailAddress(playeremail, 'playeremail', errTo(callback, function() {
									thismodule.checkPlayerAge(thismodule, squadkey, playeremail, clubname, cityname, squadname, season, targetyear, errTo(callback, callback));
								}), 'The player email is invalid');
							}));
						}));
					}));
				}));
			}));
		}
		
	    /**
	     * Check the player is eligible to play for the team by checking the age requirement
	     * @param {string} playeremail - the email address of the player which can be used to get player details involved in the checking
		 * @param {string} clubname - use to get squad details to enable checking of details of the squad
		 * @param {string} cityname - use to get squad details to enable checking of details of the squad
	     * @param {string} squadname - use to get squad details to enable checking of details of the squad
	     * @param {string} season - use to get squad details to enable checking of details of the squad
		 * @param {number} targetyear - specified over the current year for the player age check
	     * @param {callback} callback - notification of error or success
	     **/
		checkPlayerAge(thismodule: any, squadkey: string, playeremail: string, clubname: string, cityname: string, squadname: string, season: string, targetyear: number, callback: any) {
			var playerAgeChecker = thismodule.comparePlayerAgeWithRulesForPlayerAgesAndSquads;
			var overAgeChecker = thismodule.isPlayerRightAgeForOverAgeSquad;
			var underAgeChecker = thismodule.isPlayerRightAgeForUnderAgeSquad;
			thismodule._players.get(clubname + '~' + cityname + '~' + playeremail, errTo(callback, function (playervalue) {
				thismodule._squads.get(squadkey, errTo(callback, function (squadvalue) {
					playerAgeChecker(targetyear, playervalue.dob, squadvalue.agelimit, overAgeChecker, underAgeChecker, callback);
				}));
			}));
		}

	    /**
	     * Check the player age against the rules for squads and reject if not valid
	     * 
	     * When a player's age at the start of the year the season is less than an 'over' value they get rejected.
	     * A similar check for 'under ' squads occurs for players who are too old being rejected.
		 * Seasons can be any notation that the user wishes to describe, so this makes the assumption using the current
		 * date and taking the start of the year for the current date - unless specified in the target year.
		 * 
	     * @param {number} targetyear - the age needs to be checked for a specific year so state the year here
		 * @param {string} playersdob - need to no the player date of birth to perform the check.  Should accept any string format
		 * 								as long as the Date type can parse.  No error checking will occur for invalid formats.
		 * @param {string} squadagelimit - a string that represents the age limit, could be under 12 or could be over 16
		 * 								   with the prefix either a under or over.  Not validating the string.  It should be valid
		 * 								   when it gets to here.
	     * @param {any} isPlayerRightAgeForOverAgeSquad - the function to do the over age check - to fit in with Javascript plumbing really
	     * @param {any} isPlayerRightAgeForUnderAgeSquad - the function to do the under age check - to fit in with Javascript plumbing really
	     * @param {callback} callback - notification of error or success
	     **/
		comparePlayerAgeWithRulesForPlayerAgesAndSquads(targetyear: number, playersdob: string, squadagelimit: string, 
			isPlayerRightAgeForOverAgeSquad: any, isPlayerRightAgeForUnderAgeSquad: any, callback: any) {
			if (!targetyear)
				targetyear = new Date(Date.now()).getFullYear();
			var playerdob = new Date(playersdob);
			var playerage: number = targetyear - playerdob.getFullYear();
			isPlayerRightAgeForOverAgeSquad(squadagelimit, playerage, 
				errTo(callback, function() { 
					isPlayerRightAgeForUnderAgeSquad(squadagelimit, playerage, errTo(callback, callback));	
				}));
		}
		
	    /**
	     * Performs the check for a players age and fails it via the callback if the player is too young
	     *  
		 * @param {number} playerage - the age of the player e.g. 13
		 * @param {string} squadagelimit - a string that represents the age limit, could be under 12 or could be over 16
	     * @param {callback} callback - notification of error. Completion means no callback.  The last in the chain should handle that
	     **/		
		isPlayerRightAgeForOverAgeSquad(squadagelimit: string, playerage: number, callback: any) {
			var prefix: string = 'over';
			var ageLimitYears: number;
			if (squadagelimit.substring(0, prefix.length) === prefix) {
				ageLimitYears = Number(squadagelimit.substring(prefix.length).trim());
				if (playerage < ageLimitYears) {
					return callback(new AgeLimitError('Player does not qualify for the squad due to being underaged'));
				} 
			}
			callback();
		}

	    /**
	     * Performs the check for a players age and fails it via the callback if the player is too old
	     *  
		 * @param {number} playerage - the age of the player e.g. 13
		 * @param {string} squadagelimit - a string that represents the age limit, could be under 12 or could be over 16
	     * @param {callback} callback - notification of error. Completion means no callback.  The last in the chain should handle that
	     **/		
		isPlayerRightAgeForUnderAgeSquad(squadagelimit: string, playerage: number, callback: any) {
			var prefix: string = 'under';
			var ageLimitYears: number;
			if (squadagelimit.substring(0, prefix.length) === prefix) {
				ageLimitYears = Number(squadagelimit.substring(prefix.length).trim());
				if (playerage > ageLimitYears) {
					return callback(new AgeLimitError('Player does not qualify for the squad due to being over age'));
				} 
			}
			callback();
		}
	}
}
module.exports = Service.SquadManagementService;