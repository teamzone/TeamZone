/// <reference path='../typings/tsd.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';
var createError = require('errno').create;
var AgeLimitError = createError('AgeLimitError');
var Service;
(function (Service) {
    /*
    *  Implementation for Services for Team Management like like creating clubs and managing players within teams
    *  @class
    **/
    var TeamManagementService = (function () {
        /**
        * Accepts the components that support team management like the data store.
        * @constructor
        * @param {clubdb} _clubs - The storage of clubs.
        * @param {squadsdb} _squads - The storage of squads.
        * @param {playersdb} _players - The storage of players.
        * @param (squadplayers) _squadplayers - The storage that links players to a squad
        **/
        function TeamManagementService(_clubs, _squads, _players, _squadplayers) {
            var _this = this;
            this._clubs = _clubs;
            this._squads = _squads;
            this._players = _players;
            this._squadplayers = _squadplayers;
            /**
            * Will allow creation of the club.  Supplied parameters are mandatory.
            * @param {string} clubname - the name of the club to be created.
            * @param {string} fieldname - the home field of the club.
            * @param {string} suburbname - the suburb of the home field and/or club.
            * @param {string} cityname - the name of the city the club plays in.
            * @param {string} adminemail - the email address of the main administrator of the club.  Usually the person creating the club.
            * @param {callback} callback - tell the caller if club created or there was a failure
            **/
            this.CreateClub = function (clubname, fieldname, suburbname, cityname, adminemail, callback) {
                _this.checkNotNullOrEmpty(clubname, 'clubname', callback);
                _this.checkNotNullOrEmpty(fieldname, 'fieldname', callback);
                _this.checkNotNullOrEmpty(suburbname, 'suburbname', callback);
                _this.checkNotNullOrEmpty(cityname, 'cityname', callback);
                _this.checkNotNullOrEmpty(adminemail, 'adminemail', callback);
                _this.checkEmailAddress(adminemail, 'The admin email is invalid', callback);
                var clubs = _this._clubs;
                var key = _this.clubKeyMaker(clubname, cityname);
                clubs.get(key, function (err) {
                    if (err && err.notFound) {
                        clubs.put(key, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }, function (err) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else if (err) {
                        callback(err);
                    }
                    else {
                        callback(new Error('Club in the same city cannot be created more than once'));
                    }
                });
            };
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
            this.CreateSquad = function (clubname, cityname, squadname, season, agelimit, admin, callback) {
                _this.checkNotNullOrEmpty(clubname, 'clubname', callback);
                _this.checkNotNullOrEmpty(cityname, 'cityname', callback);
                _this.checkNotNullOrEmpty(squadname, 'squadname', callback);
                _this.checkNotNullOrEmpty(season, 'season', callback);
                _this.checkNotNullOrEmpty(agelimit, 'agelimit', callback);
                _this.checkNotNullOrEmpty(admin, 'admin', callback);
                _this.checkEmailAddress(admin, 'The admin email is invalid', callback);
                var squads = _this._squads;
                var key = _this.squadKeyMaker(squadname, season);
                squads.get(key, function (err) {
                    if (err && err.notFound) {
                        squads.put(key, { agelimit: agelimit, admin: admin }, { sync: true }, function (err) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                    else if (err) {
                        callback(err);
                    }
                    else {
                        callback(new Error('Squad in the same club and season cannot be created more than once'));
                    }
                });
            };
            /**
            * Add a player to a squad.
            * @param {string} squadname - the name of the squad (key)
            * @param {string} season - a name for the season the squad is playing in (key).
            * 						   For example 2015, 2014/15 - this should map to a season dataset for further details about the season.
            * @param {string} playeremail - the email address of the player which will link to players under a club
            * @param {callback} callback - tell the caller if squad created or there was a failure
            **/
            this.AddPlayerToSquad = function (squadname, season, playeremail, callback) {
                var squadplayers = _this._squadplayers;
                _this.checkNotNullOrEmpty(squadname, 'squadname', callback);
                _this.checkNotNullOrEmpty(season, 'season', callback);
                _this.checkNotNullOrEmpty(playeremail, 'playeremail', callback);
                _this.checkEmailAddress(playeremail, 'The player email is invalid', callback);
                _this.checkPlayerAge(playeremail, squadname, season, function (err) {
                    if (err)
                        callback(err);
                    else {
                        var key = squadname + '~' + season + '~' + playeremail;
                        squadplayers.get(key, function (err) {
                            if (err && err.notFound) {
                                squadplayers.put(key, { playeremail: playeremail }, { sync: true }, function (err) {
                                    if (err)
                                        callback(err);
                                    else
                                        callback();
                                });
                            }
                            else if (err)
                                callback(err);
                            else
                                callback(new Error('Cannot add the same player twice to a squad'));
                        });
                    }
                });
            };
        }
        /**
         * Create the key value for the clubs dataset
         * @param {string} clubname - the club is the first part of the key
         * @param {string} cityname - the city is the second part of the key
         **/
        TeamManagementService.prototype.clubKeyMaker = function (clubname, cityname) {
            return "".concat(clubname, "~", cityname);
        };
        /**
         * Create the key value for the squads dataset
         * @param {string} clubname - the club is the first part of the key
         * @param {string} cityname - the city is the second part of the key
         * @param {string} squadname - the squad is the second part of the key
         * @param {string} season - the season is the fourth part of the key
         **/
        TeamManagementService.prototype.squadKeyMaker = function (squadname, season) {
            return ''.concat(squadname, '~', season);
        };
        /**
         * Checks for null or empty strings
         * @param {string} parametervalue - the value to check
         * @param {string} parametername - the name of the value to check
         * @param {callback} callback - will get called with the error if it exists
         **/
        TeamManagementService.prototype.checkNotNullOrEmpty = function (parametervalue, parametername, callback) {
            if (parametervalue === undefined || parametervalue === null || parametervalue.trim().length === 0) {
                callback(new Error('The argument ' + parametername + ' is a required argument'));
            }
        };
        /**
         * Check validity of an email address
         * @param {string} email - the address to check
         * @param {string} invalidMessage - a message to include in an Error when email address is invalid
         * @param {callback} callback - notification of an error in an email address
         **/
        TeamManagementService.prototype.checkEmailAddress = function (email, invalidMessage, callback) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email))
                callback(new Error(invalidMessage));
        };
        /**
         * Check the player is eligible to play for the team by checking the age requirement
         * @param {string} playeremail - the email address of the player which can be used to get player details involved in the checking
         * @param {string} squadname - use to get squad details to enable checking of details of the squad
         * @param {string} season - use to get squad details to enable checking of details of the squad
         * @param {callback} callback - notification of error or success
         **/
        TeamManagementService.prototype.checkPlayerAge = function (playeremail, squadname, season, callback) {
            //get player details from playerdb
            var squads = this._squads;
            this._players.get(playeremail, function (err, playervalue) {
                if (err)
                    callback(err);
                else {
                    //squads are created unders clubs in sublevel, therefore the key need only include squadname and season
                    //as club is already in context and therefore no need to pass in the extra information that can make for more
                    //unwieldy parameter lists
                    var squad = squads.get(squadname + '~' + season, function (err, squadvalue) {
                        if (err)
                            callback(err);
                        else {
                            var prefix = 'over';
                            //when a player's age at the start of the year the season is in is less than an over value they get rejected
                            //seasons can be any notation that the user wishes to describe, so this makes the assumption using the current
                            //date and taking the start of the year for the current date
                            var currentyear = new Date(Date.now()).getFullYear();
                            var playerdob = new Date(playervalue.dob);
                            var playerage = currentyear - playerdob.getFullYear();
                            if (squadvalue.agelimit.substring(0, prefix.length) === prefix) {
                                var ageLimitYears = Number(squadvalue.agelimit.substring(prefix.length).trim());
                                if (playerage < ageLimitYears) {
                                    callback(new AgeLimitError('Player does not qualify for the squad due to being underaged'));
                                    return;
                                }
                            }
                            else {
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
        };
        return TeamManagementService;
    })();
    Service.TeamManagementService = TeamManagementService;
})(Service = exports.Service || (exports.Service = {}));
module.exports = Service.TeamManagementService;
//# sourceMappingURL=TeamManagementService.js.map