/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express-validator/express-validator.d.ts' />
/// <reference path='../typings/node/node.d.ts' />

/*jslint nomen: true */
'use strict';

import express = require("express");
import Flash = require("./flash");
import Service = require("../lib/IUserManagementService");
import webRequest = require("./IWebRequest");

/*
*  Handles web requests to register a new user
*  @class
**/
export class UserRegister implements webRequest.IWebRequest {
    /**
    * Accepts the service component that will handle the registration of a new user in the database
    * @constructor
    * @param {IUserManagementService} _ums - service to provide the ability to register the new user.
    **/  
    constructor(private _ums: Service.IUserManagementService) { 
    }
    
    /**
    * Handles the incoming request by validating the incoming data and then asking the user management service to register the user
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    post = (req: express.Request, res: express.Response) => {
    
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password', 'Password length needs to be at least 8 characters').len(8);
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email does not appear to be valid').isEmail();
        
        var errors = req.validationErrors();
        var flash: Flash = new Flash();
        
        //work around for access to ums in nested callback code
        var ums = this._ums;
        
        if (errors && errors.length > 0) {
            var errorCount: number = errors.length;
            var msgs = [];
            for (var i: number = 0; i < errorCount; i++) {
                msgs.push({ msg: errors[i].msg});
            }
            flash.type = 'alert-danger';
            flash.messages = msgs;
            res.render('register', { flash: flash });
        } else {
            var username = req.body.email;
            var password = req.body.password;
            ums.RegisterUser(username, password, function(err, resregister) {
              if (err) {
                flash.type = 'alert-danger';
                flash.messages = [{ msg: err.message }];
                res.render('register', { flash: flash });
              } else {
                flash.type = 'alert-success';
                flash.messages = [{ msg: 'Please check your email to verify your registration. Then you will be ready to log in!' }];
                res.render('login', { flash: flash });
              }
            });
        }
    }
    
    /**
    * Renders the register page when requested by a user
    * @constructor
    * @param {express.Request} req - incoming request object furnished by Express
    * @param {express.Response} req - incoming response object furnished by Express
    **/  
    get = (req: express.Request, res: express.Response) => {
        res.render('register');
    }
}

module.exports = UserRegister;