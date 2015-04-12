/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/// <reference path='../../typings/moment/moment.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';

import pms = require('./IPlayerManagementService');
import assert = require('assert');
import _ = require('underscore');
import moment = require('moment');

export module Service {

	/*
	*  Implementation for Services for Player Management like like adding and retrieving players 
	*  @class
	**/
	export class PlayerManagementService implements pms.IPlayerManagementService {

		/**
		* Accepts the components that support player management like the data store.  
		* @constructor
		* @param {playersdb} _players - The storage of players.
		**/
		constructor(private _players: any) {
		}

		/**
		* Add a player to a club. Player details in parameters and are self explanatory
		* @param {string} clubname - the name of the club (key) - we need to relate back to the club
		* @param {string} cityname - the name of the city the club is in (key) - we need to relate back to the club
		* @param {Add~callback} callback - tell the caller if squad created or there was a failure
		**/
        AddPlayer = (clubname: string, cityname: string, firstname: string, lastname: string, dob: string, address: string, suburb: string, postcode: string, phone: string, email: string, callback: any) => {
            if (this.isValidDate(dob, callback)) {
                //check that the record does not exist anymore
                var key: string = this.keyMaker(clubname, cityname, email);
                var players = this._players;
    			//check that the record does not exist anymore
                players.get(key, function(err, value) {
                    if (err && !err.notFound) {
                        callback(err, null);
                    } else {
    		            if (value) {
                           callback(new Error('Cannot add this player, the player already exists'));
                        } else {
                           players.put(key, { firstname: firstname, lastname: lastname, dob: dob, address: address, suburb: suburb, postcode: postcode, phone: phone, email: email }, { sync: true }, 
    					        function (err) {
    						        if (err) {
                                        callback(err);
                                    } else {
                                        callback();
                                    }
    				            });
                        }
                    }
                 });
            }
	    }

		/**
		* Get a player from a club. 
		* @param {string} clubname - the name of the club (key) - we need to relate back to the club
		* @param {string} cityname - the name of the city the club is in (key) - we need to relate back to the club
		* @param {string} email - unique id for the player.  We assume they have an email address
		* @param {Add~callback} callback - tell the caller if player created or there was a failure
		**/
	    GetPlayer = (clubname: string, cityname: string, email: string, callback: any) => {
    		this._players.get(this.keyMaker(clubname, cityname, email), function (err, value) { 
                if (err) {
                    callback(err);
                } else {
                    //recompose the object to include the key values
                    var playerObject = {
                        clubname: clubname,
                        cityname: cityname,
                        firstname: value.firstname,
                        lastname: value.lastname,
                        dob: value.dob,
                        address: value.address,
                        suburb: value.suburb,
                        postcode: value.postcode,
                        phone: value.phone,
                        email: value.email
                    };
    			    callback(undefined, playerObject);
                }
    		});
	    }

		/**
		* Produce the key string for the player object to be used in leveldb. 
		* @param {string} clubname - the name of the club (key) - we need to relate back to the club
		* @param {string} cityname - the name of the city the club is in (key) - we need to relate back to the club
		* @param {string} email - unique id for the player.  We assume they have an email address
		**/
        keyMaker(clubname: string, cityname: string, email: string) : string {
            return "".concat(clubname, "~", cityname, "~", email);
        }

		/**
		* Validates a date against several different valid formats. 
		* @param {string} clubname - the name of the club (key) - we need to relate back to the club
		* @param {string} cityname - the name of the city the club is in (key) - we need to relate back to the club
		* @param {string} email - unique id for the player.  We assume they have an email address
		* @param {Add~callback} callback - tell the caller if there is a date failure
		**/
        isValidDate(d: string, callback: any) : void {
            var validDateFormats = ['DD MMM YYYY', 'D MMM YYYY', 'DD-MM-YYYY', 'D/MM/YYYY', 'D/M/YYYY', 'DD-MMM-YYYY', 'YYYY-MM-DD'],
                i = 0,
                len = validDateFormats.length,
                isValid = false;
            for (; i < len; ) { 
                if ((moment(d, validDateFormats[i], true)).isValid()) {
                    isValid = true;
                    i = len;
                }
                i++;
            } 
            if (!isValid) {
                callback(new Error('The date is in an incorrect format'));
            }
            return isValid;
        }
	}
	
/**
 * A generic callback for any retrieval function for leveldb.
 * @callback Retrieve~callback
 * @param {Error} populated with an a standard Error object when there is a failure with leveldb
 * @param {any} the contents of the database returned as is.  It will most likely be a JSON formatted object
 */
 
/**
 * A generic callback for any delete function for leveldb.
 * @callback Delete~callback
 * @param {Error} populated with an a standard Error object when there is a failure with leveldb
 */	
 
/**
 * A generic callback for any add function for leveldb.
 * @callback Add~callback
 * @param {Error} populated with an a standard Error object when there is a failure with leveldb
 */
 
}

module.exports = Service.PlayerManagementService;