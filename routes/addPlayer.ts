/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express/express.ext.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';

import express = require("express");
import Flash = require("./flash");
import ClubManagement = require('../lib/ts/IClubManagementService');
import PlayerManagement = require("../lib/ts/IPlayerManagementService");
import webRequest = require("./IWebRequest");
import expressValidator = require('express-validator');

/*
*  Handles web requests to manage players
*  @class
**/
export class AddPlayer implements webRequest.IWebRequest {
  
    /**
    * Accepts the service component that will handle the creation of a new club in the database
    * @constructor
    * @param {IPlayerManagementService} _pms - service to provide the ability to create add a player.
    * @param {IClubManagementService} _cms - service to provide the ability to load club and city.
    **/  
    constructor(private _pms: PlayerManagement.IPlayerManagementService, private _cms: ClubManagement.IClubManagementService) {
    }
    
    /**
    * Handles the incoming request by validating the incoming data and then asking the team management service to create the club
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    post = (req: express.Request, res: express.Response) => {

        req.checkBody('clubname', 'Club is required').notEmpty();
        req.checkBody('cityname', 'City is required').notEmpty();
        req.checkBody('firstname', 'First Name is required').notEmpty();
        req.checkBody('lastname', 'Last Name is required').notEmpty();
        req.checkBody('dob', 'Date of Birth is required').notEmpty();
        req.checkBody('address', 'Address is required').notEmpty();
        req.checkBody('suburb', 'Suburb is required').notEmpty();
        req.checkBody('postcode', 'Postcode is required').notEmpty();
        req.checkBody('phone', 'Phone is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email does not appear to be valid').isEmail();

        var flash: Flash = new Flash(),
            errors = req.validationErrors();

        if (errors && errors.length > 0) {
            var errorCount: number = errors.length;
            var msgs = [];
            for (var i: number = 0; i < errorCount; i++) {
                msgs.push({ msg: errors[i].msg});
            }
            flash.type = 'alert-danger';
            flash.messages = msgs;
            res.render('addPlayer', { flash: flash });
        } else {            
            this._pms.AddPlayer(req.body.clubname, req.body.cityname, req.body.firstname, req.body.lastname, 
                                req.body.dob, req.body.address, req.body.suburb, req.body.postcode, 
                                req.body.phone, req.body.email, function (err) {
                if (err) {
                    flash.type = 'alert-danger';
                    flash.messages = [{ msg: err.message }];
                    res.render('addPlayer', { flash: flash });
                } else {
                    flash.type = 'alert-success';
                    flash.messages = [{ msg: 'Player has been successfully added.' }];
                    res.render('addPlayer', { flash: flash });
                }
            });
        }
    }
    
    /**
    * Renders the create club page when requested by a user
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    get = (req: express.Request, res: express.Response) => {
        this._cms.GetClubs(req.session.user.email, function(err, clubs) {
            if(!err) {
                res.render('addPlayer', { clubs: clubs });
                return;
            }
            
            if(err.notFound) {
                res.render('notClubAdmin');
                return;
            }
            
            var flash: Flash = new Flash();
            flash.type = 'alert-danger';
            flash.messages = [{ msg: 'An unexpected error occurred. Detailed message was: ' + err.message }];
            res.render('addPlayer', { flash: flash });
        });
    }
}

module.exports = AddPlayer;