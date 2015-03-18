/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';

import express = require("express");
import Flash = require("./flash");
import Service = require("../lib/ts/IUserManagementService");
import webRequest = require("./IWebRequest");

/*
*  Handles web requests to login a user
*  @class
**/
export class UserLogin implements webRequest.IWebRequest {
    /**
    * Accepts the service component that will handle the registration of a new user in the database
    * @constructor
    * @param {IUserManagementService} _ums - service to provide the ability to register the new user.
    **/  
    constructor(private _ums: Service.IUserManagementService) { 
    }
    /**
    * We attempt to login the user via the service.  No special validation required, the service will match the user and fail the 
    * login process if this fails.
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    post = (req: express.Request, res: express.Response) =>  {
  
        var flash: Flash = new Flash();
        
        // pull the form variables off the request body
        var username: string = req.body.username;
        var password: string = req.body.password;
    
        this._ums.LoginUser(username, password, function(err, reslogin) {
            if (err) {
                flash.type = 'alert-danger';
                flash.messages = [{ msg: err.message }];
                res.render('login', { flash: flash });
            } else if (reslogin.loggedIn) {
                req.session.authenticated = true;
                req.session.user = { email: username };
                res.redirect('dashboard');
            } else {
                flash.type = 'alert-info';
                flash.messages = [{ msg: 'Login failed.  You may need to still verify your account or incorrect username/password was entered' }];
                res.render('login', { flash: flash });
            }
        });
    }
    
    /**
    * Renders the login page when requested by a user
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    get = (req: express.Request, res: express.Response) => {
        res.render('login');
    }
  }

module.exports = UserLogin;