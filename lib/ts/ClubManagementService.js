/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var servicebase = require('./ServiceBase');
var kf = require('./KeyFactory');
var errTo = require('errto');
var Service;
(function (Service) {
    /*
    *  Implementation for Services for Club Management like like creating clubs and amending club information
    *  @class
    **/
    var ClubManagementService = (function (_super) {
        __extends(ClubManagementService, _super);
        /**
        * Accepts the components that support team management like the data store.
        * @constructor
        * @param {clubdb} _clubs - The storage of clubs.
        **/
        function ClubManagementService(_clubs) {
            var _this = this;
            _super.call(this);
            this._clubs = _clubs;
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
                var clubs = _this._clubs;
                var key = kf.KeyFactory.clubKeyMaker(clubname, cityname);
                _super.prototype.validateParameters.call(_this, _this.validationParametersForCreatingClub(clubname, fieldname, suburbname, cityname, adminemail), errTo(callback, function () {
                    clubs.get(key, function (err) {
                        if (err && err.notFound) {
                            clubs.put(key, { field: fieldname, suburb: suburbname, admin: adminemail }, { sync: true }, errTo(callback, callback));
                        }
                        else if (err) {
                            callback(err);
                        }
                        else {
                            callback(new Error('Club in the same city cannot be created more than once'));
                        }
                    });
                }));
            };
            this.GetClubs = function (adminemail, callback) {
                var clubs = [];
                var err = null;
                _this._clubs.createReadStream().on('data', function (data) {
                    if (adminemail === data.value.admin) {
                        clubs.push(data.key);
                    }
                }).on('error', function (error) {
                    err = error;
                }).on('end', function () { return callback(err, clubs); });
            };
        }
        /**
        * Supplies an array parameter values and their names and links to the validations required for these parameters
        * @param {string} clubname - the name of the club to be created.
        * @param {string} fieldname - the home field of the club.
        * @param {string} suburbname - the suburb of the home field and/or club.
        * @param {string} cityname - the name of the city the club plays in.
        * @param {string} adminemail - the email address of the main administrator of the club.  Usually the person creating the club.
        **/
        ClubManagementService.prototype.validationParametersForCreatingClub = function (clubname, fieldname, suburbname, cityname, adminemail) {
            return [
                { name: 'clubname', content: clubname, validations: [this.checkNotNullOrEmpty] },
                { name: 'fieldname', content: fieldname, validations: [this.checkNotNullOrEmpty] },
                { name: 'suburbname', content: suburbname, validations: [this.checkNotNullOrEmpty] },
                { name: 'cityname', content: cityname, validations: [this.checkNotNullOrEmpty] },
                { name: 'adminemail', content: adminemail, validations: [this.checkNotNullOrEmpty, { v: this.checkEmailAddress, m: 'The admin email is invalid' }] }
            ];
        };
        return ClubManagementService;
    })(servicebase.Service.ServiceBase);
    Service.ClubManagementService = ClubManagementService;
})(Service = exports.Service || (exports.Service = {}));
module.exports = Service.ClubManagementService;
//# sourceMappingURL=ClubManagementService.js.map