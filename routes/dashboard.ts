/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express/express.ext.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';

import express = require("express");
import webRequest = require("./IWebRequest");

/*
*  Handles web requests for the dashboard view
*  @class
**/
export class Dashboard implements webRequest.IWebRequest {
  
    constructor() { 
    }
    
    /**
    * not needed
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    post = (req: express.Request, res: express.Response) => {
    }
    
    /**
    * Renders the dashboard view
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    get = (req: express.Request, res: express.Response) => {
        res.render('dashboard', { user: req.session.user });
    }
}

module.exports = Dashboard;