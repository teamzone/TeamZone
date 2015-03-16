/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express-validator/express-validator.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';

import express = require("express");
import Flash = require("./flash");
import Service = require("../lib/ITeamManagementService");
import webRequest = require("./IWebRequest");

/*
*  Handles web requests to manage creation of clubs
*  @class
**/
export class ManageClub implements webRequest.IWebRequest {
  
  /**
  * Accepts the service component that will handle the creation of a new club in the database
  * @constructor
  * @param {ITeamManagementService} _tms - service to provide the ability to create a new club.
  **/  
  constructor(private _tms: Service.ITeamManagementService) { 
  }
  
  /**
  * Handles the incoming request by validating the incoming data and then asking the team management service to create the club
  * @constructor
  * @param {express.Request} req - incoming request object furnished by Express
  * @param {express.Response} req - incoming response object furnished by Express
  **/  
  post = (req: express.Request, res: express.Response) => {
  
  }
  
  /**
  * Renders the create club page when requested by a user
  * @constructor
  * @param {express.Request} req - incoming request object furnished by Express
  * @param {express.Response} req - incoming response object furnished by Express
  **/  
  get = (req: express.Request, res: express.Response) => {
    res.render('manageClub');
  }
}

module.exports = ManageClub;