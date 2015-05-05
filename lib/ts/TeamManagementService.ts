/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';

import tms = require('./ITeamManagementService');
import assert = require('assert');
import _ = require('underscore');
var errTo = require('errto');
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
		CreateClub = (clubname: string, fieldname: string, suburbname: string, cityname: string, adminemail: string, callback: any) => {
			var clubs = this._clubs;
			var key = this.clubKeyMaker(clubname, cityname);
			this.validateParameters(this.validationParametersForCreatingClub(clubname, fieldname, suburbname, cityname, adminemail), errTo(callback, function() {
		    	clubs.get(key, function(err) {
		    		if(err && err.notFound) {
						clubs.put(key, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }, errTo(callback, callback));
		    		} else if (err) {
		    			callback(err);
				    } else {
				    	callback(new Error('Club in the same city cannot be created more than once'));
				    }
				});
			}));
		}

		/**
		* Supplies an array parameter values and their names and links to the validations required for these parameters
		* @param {string} clubname - the name of the club to be created.
		* @param {string} fieldname - the home field of the club.
		* @param {string} suburbname - the suburb of the home field and/or club.
		* @param {string} cityname - the name of the city the club plays in.
		* @param {string} adminemail - the email address of the main administrator of the club.  Usually the person creating the club.
		**/
		validationParametersForCreatingClub(clubname: string, fieldname: string, suburbname: string, cityname: string, adminemail: string) : any {
			return [ 
				{ name: 'clubname', content: clubname, validations: [ this.checkNotNullOrEmpty ] }, { name: 'fieldname', content: fieldname, validations: [ this.checkNotNullOrEmpty ] }, 
			  	{ name: 'suburbname', content: suburbname, validations: [ this.checkNotNullOrEmpty ] }, { name: 'cityname', content: cityname, validations: [ this.checkNotNullOrEmpty ] }, 
			  	{ name: 'adminemail', content: adminemail, validations: [ this.checkNotNullOrEmpty, { v: this.checkEmailAddress, m: 'The admin email is invalid' } ] }
			];
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
			var key = this.squadKeyMaker(clubname, cityname, squadname, season);
			var squads = this._squads;
			this.validateParameters(this.validationParametersForCreatingSquad(clubname, cityname, squadname, season, agelimit, admin), errTo(callback, function() {
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
			var squadkey = this.squadKeyMaker(clubname, cityname, squadname, season);
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
		* Enacts a series of validations on parameter values
		* 
		* @param {any} parameters - consists of an array of parameter values, names and associated validations
		* @param {callback} callback - a failure to validate correctly results in immediate notification to the caller with no other validations taking place
		**/
		validateParameters(parameters: any, callback: any) {
			var validationCalls = this.flattenValidationCalls(parameters);
			var validationCallsLength = validationCalls.length;
			if (validationCallsLength === 0) return callback();
			if (validationCallsLength === 1) {
				validationCalls[0].validator(validationCalls[0].fieldcontent, validationCalls[0].fieldname, errTo(callback, callback), validationCalls[0].message);
			} else {
				// obtaining a reference to the function to enable recursive processing in javascript
				var process = this.processFlattenedValidationCalls;
				process(validationCalls, 0, validationCallsLength, process, errTo(callback, callback));
			}
		}

		/**
		* Called from validateParameters to process a list of parameters and validate their values.  Is called recursively to process values
		* and work in with errTo and callback processing
		* 
		* @param {any} validationCalls - this is a more function friendly representation of the parameters to process with the functions repeated for 
		* 		each parameter.
		* @param {number} processed - processed number of parameters. Gets incremented after each sucessful validation
		* @param {number} totalValidations - the total number of validations to process and compared with processed to check for end state
		* @param {callback} callback - a failure to validate correctly results in immediate notification to the caller with no other validations taking place
		**/
		processFlattenedValidationCalls(validationCalls: any, processed: number, totalValidations: number, process: any, callback: any) {
			if (processed === totalValidations) return callback();
			var parameter: any;
			parameter = validationCalls[processed];
			parameter.validator(parameter.content, parameter.name, errTo(callback, function() {
				process(validationCalls, processed + 1, totalValidations, process, errTo(callback, callback));
			}), parameter.message);
		}

		/**
		* Called from validateParameters to flatten the list of parameters so that the array is a simple linear list of parameter names, content
		* 	and validations.  This makes the processing of the validations easier for processFlattenedValidationCalls
		* 
		* @param {any} parameters - consists of an array of parameter values, names and associated validations
		* @param {callback} callback - a failure to validate correctly results in immediate notification to the caller with no other validations taking place
		* @returns {any} a flattened array of parameter names, content and validation - names and content will be repeated if there are multiple validations for
		* 	the same parameter name/content pair.
		**/
		flattenValidationCalls(parameters: any) {
			var calls = [];
			var parameterslength = parameters.length;
			var validationslength: number;
			var i: number;
			var j: number;
			var parameter: any;
			var validation: any;
			for (i = 0; i < parameterslength; i = i + 1) {
				parameter = parameters[i];
				validationslength = parameter.validations.length;
				for (j = 0; j < validationslength; j = j + 1) {
					validation = parameter.validations[j];
					if (validation.v !== undefined) {
						calls.push({ name: parameter.name, content: parameter.content, validator: validation.v, message: validation.m });
					} else {
						calls.push({ name: parameter.name, content: parameter.content, validator: validation, message: undefined });
					}
				}
			}
			return calls;
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
	    checkNotNullOrEmpty(parametervalue: string, parametername: string, callback: any, invalidMessage?: string) {
	    	if (parametervalue === undefined || parametervalue === null || parametervalue.trim().length === 0) {
	    		return callback(new Error('The argument ' + parametername + ' is a required argument'));
	    	}
	    	callback();
	    }
	    
	    /**
	     * Check validity of an email address
	     * @param {string} email - the address to check
	     * @param {string} invalidMessage - a message to include in an Error when email address is invalid
	     * @param {callback} callback - notification of an error in an email address
	     **/
	    checkEmailAddress(email: string, parametername: string, callback: any, invalidMessage?: string) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		if (!re.test(email)) {
    			return callback(new Error(invalidMessage));
    		}
    		callback();
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
			thismodule._players.get(clubname + '~' + cityname + '~' + playeremail, function(err, playervalue) {
				if (err) 
					callback(err);
				else {
					thismodule._squads.get(squadkey, function(err, squadvalue) {
						if (err)
							callback(err);
						else {
							playerAgeChecker(targetyear, playervalue.dob, squadvalue.agelimit, overAgeChecker, underAgeChecker, callback);
						}
					});
				} 
			});
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
module.exports = Service.TeamManagementService;