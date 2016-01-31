/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express-validator/express-validator.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';

import express = require("express");
import Flash = require("./flash");
import Service = require("../lib/ts/ISquadManagementService");
import webRequest = require("./IWebRequest");

/*
*  Handles web requests to manage creation of clubs
*  @class
**/
export class AddSquadPlayer implements webRequest.IWebRequest {
  
    /**
    * Accepts the service component that will handle the creation of a new club in the database
    * @constructor
    * @param {ISquadManagementService} _tms - service to provide the ability to create/amend/update/remove squads.
    **/  
    constructor(private _sms: Service.ISquadManagementService) { 
    }
    
    /**
    * Handles the incoming request by validating the incoming data and then asking the team management service to create the club
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    post = (req: express.Request, res: express.Response) => {
        res.write('Do be done');
    }
    
    /**
    * Renders the create club page when requested by a user
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    get = (req: express.Request, res: express.Response) => {
        // we need this populated from a user session object
        var clubname = 'Western Knights';
        var cityname = 'Perth';
        var squadname = req.body.squadname;
        var season = req.body.season;
        var sms = this._sms;
        var flash: Flash = new Flash();
        sms.GetPlayersForClubNotInSquad(clubname, cityname, squadname, season, function(err, clubplayers) {
            if (err) {
                flash.type = 'alert-danger';
                flash.messages = [{ msg: err.message }];
                res.render('addSquadPlayer', { flash: flash });
            } else {
                sms.GetPlayersForSquad(clubname, cityname, squadname, season, function(err, squadplayers) {
                    if (err) {
                        flash.type = 'alert-danger';
                        flash.messages = [{ msg: err.message }];
                        res.render('addSquadPlayer', { flash: flash });
                    } else {
                        res.render('addSquadPlayer', { 
                            clubplayers: clubplayers,
                            squadplayers: squadplayers
                        });
                    }
                });
            }
        });
    }
}

module.exports = AddSquadPlayer;