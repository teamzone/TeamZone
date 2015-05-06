/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express-validator/express-validator.d.ts' />
/// <reference path='../typings/node/node.d.ts' />

'use strict';

import express = require("express");
import Flash = require("./flash");
import Service = require("../lib/ts/ISquadManagementService");
import webRequest = require("./IWebRequest");

/*
*  Handles web requests to manage creation of clubs
*  @class
**/
export class ManageSquad implements webRequest.IWebRequest {
  
  /**
  * Accepts the service component that will handle the management of squads in the database
  * @constructor
  * @param {ISquadManagementService} _sms - service to provide the ability to manage squads
  **/  
  constructor(private _sms: Service.ISquadManagementService) { 
  }
  
  /**
  * Handles the incoming request by validating the incoming data and then asking the team management service to make updates to the squad
  * @constructor
  * @param {express.Request} req - incoming request object furnished by Express
  * @param {express.Response} req - incoming response object furnished by Express
  **/  
  post = (req: express.Request, res: express.Response) => {
  
  }
  
  /**
  * Renders the create magae squad page when requested by a user
  * @constructor
  * @param {express.Request} req - incoming request object furnished by Express
  * @param {express.Response} req - incoming response object furnished by Express
  **/  
  get = (req: express.Request, res: express.Response) => {
    res.render('manageSquad');
  }
}

module.exports = ManageSquad;