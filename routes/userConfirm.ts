/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/node/node.d.ts' />

import express = require("express");
import Flash = require("./flash");
import Service = require("../lib/IUserManagementService");
import webRequest = require("./IWebRequest");
var _ = require('underscore');

/*
*  Handles web requests to confirm registration of a new user
*  @class
**/
export class UserConfirm implements webRequest.IWebRequest {
  /**
  * Accepts the service component that will handle the registration of a new user in the database
  * @constructor
  * @param {IUserManagementService} _ums - service to provide the ability to register the new user.
  **/  
  constructor(private _ums: Service.IUserManagementService) { 
  }

  /**
  * Post is not permitted so an error is thrown if this is attempted
  * @constructor
  * @param {express.Request} req - incoming request object furnished by Express
  * @param {express.Response} req - incoming response object furnished by Express
  **/  
  post = (req: express.Request, res: express.Response) => {
    throw new Error('Post is not permitted for confirmation');
  }
  
  /**
  * Performs confirmation of a new user, extracting the components from the url and checking via the service
  * for correctness.  It will reject confirmation if it doesn't checkout with the service and notified via the login page
  * @constructor
  * @param {express.Request} req - incoming request object furnished by Express
  * @param {express.Response} req - incoming response object furnished by Express
  **/  
  get = (req: express.Request, res: express.Response) => {
    var flash: Flash = new Flash();
    var email: string = req.query.u;
    var token: string = req.query.t;
    if (_.isUndefined(email) || _.isUndefined(token)) {
        flash.type = 'alert-danger';
        flash.messages = [{ msg: 'Invalid confirmation url' }];
        res.render('login', { flash: flash });
        return;
    }
    this._ums.ConfirmRegisterUser(email, token, function(err, reslogin) {
      if (err) {
        flash.type = 'alert-danger';
        flash.messages = [{ msg: err.message }];
        res.render('login', { flash: flash });
      }
      else {
          flash.type = 'alert-success';
          flash.messages = [{ msg: 'You have been successfully confirmed, please log in.' }];
          res.render('login', { flash: flash });
      }
    });
  }
}

module.exports = UserConfirm;