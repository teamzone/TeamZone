/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express/express.ext.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';
var Flash = require("./flash");
/*
*  Handles web requests to manage creation of clubs
*  @class
**/
var CreateClub = (function () {
    /**
    * Accepts the service component that will handle the creation of a new club in the database
    * @constructor
    * @param {ITeamManagementService} _tms - service to provide the ability to create a new club.
    **/
    function CreateClub(_cms) {
        var _this = this;
        this._cms = _cms;
        /**
        * Handles the incoming request by validating the incoming data and then asking the team management service to create the club
        * @constructor
        * @param {express.Request} req - incoming request object furnished by Express
        * @param {express.Response} req - incoming response object furnished by Express
        **/
        this.post = function (req, res) {
            var cms = _this._cms;
            cms.GetClubs(req.session.user.email, function (err, clubs) {
                if (clubs && clubs.length > 0) {
                    res.redirect('/manageClub');
                }
                else {
                    req.checkBody('clubname', 'Club name is required').notEmpty();
                    req.checkBody('cityname', 'City is required').notEmpty();
                    req.checkBody('suburbname', 'Suburb is required').notEmpty();
                    req.checkBody('fieldname', 'Field is required').notEmpty();
                    req.checkBody('adminemail', 'Administrator Email is required').notEmpty();
                    req.checkBody('adminemail', 'Administrator Email does not appear to be valid').isEmail();
                    var errors = req.validationErrors();
                    var flash = new Flash();
                    if (errors && errors.length > 0) {
                        var errorCount = errors.length;
                        var msgs = [];
                        for (var i = 0; i < errorCount; i++) {
                            msgs.push({ msg: errors[i].msg });
                        }
                        flash.type = 'alert-danger';
                        flash.messages = msgs;
                        res.render('createClub', { flash: flash });
                    }
                    else {
                        var clubname = req.body.clubname;
                        var cityname = req.body.cityname;
                        var suburbname = req.body.suburbname;
                        var fieldname = req.body.fieldname;
                        var adminemail = req.body.adminemail;
                        cms.CreateClub(clubname, fieldname, suburbname, cityname, adminemail, function (err) {
                            if (err) {
                                flash.type = 'alert-danger';
                                flash.messages = [{ msg: err.message }];
                                res.render('createClub', { flash: flash });
                            }
                            else {
                                flash.type = 'alert-success';
                                flash.messages = [{ msg: 'Club has been successfully created.  You can now manage the club to add teams, squads and players and all the other functions needed to run the club.' }];
                                res.render('manageClub', { flash: flash });
                            }
                        });
                    }
                }
            });
        };
        /**
        * Renders the create club page when requested by a user
        * @constructor
        * @param {express.Request} req - incoming request object furnished by Express
        * @param {express.Response} req - incoming response object furnished by Express
        **/
        this.get = function (req, res) {
            _this._cms.GetClubs(req.session.user.email, function (err, clubs) {
                if (clubs && clubs.length > 0) {
                    res.redirect('/manageClub');
                }
                else {
                    res.render('createClub', { user: req.session.user });
                }
            });
        };
    }
    return CreateClub;
}());
exports.CreateClub = CreateClub;
module.exports = CreateClub;
//# sourceMappingURL=createClub.js.map