/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
import express = require("express");
import UserManagementService = require('../lib/UserManagementService');
class Flash {
  type : string;
  messages : IFlashMessage[];
}

interface IFlashMessage {
  msg : string;  
}

export interface IUser {
  Login(req: express.ExpressServerRequest, res: express.ExpressServerResponse);
}

export class User implements IUser {
  
  private ums: IUserManagementService;
  
  constructor(ums: IUserManagementService) { 
    this.ums = ums;
  }
  /*
  * POST Login user.
  */
  Login = (req: express.ExpressServerRequest, res: express.ExpressServerResponse) =>  {

    var flash = new Flash();
    
    // pull the form variables off the request body
    var username = req.body.username;
    var password = req.body.password;

    ums.LoginUser(username, password, function(err, reslogin) {
      if (err) {
        flash.type = 'alert-danger';
        flash.messages = [{ msg: err.message }];
        res.render('login', { flash: flash });
      }
      else {
        if (reslogin.loggedIn) {
          req.session.authenticated = true;
          res.redirect('dashboard');
        }
        else {
          flash.type = 'alert-info';
          flash.messages = [{ msg: 'Login failed.  You may need to still verify your account or incorrect username/password was entered' }];
          res.render('login', { flash: flash });
        }
      }
    });
        
  }
}

module.exports = User;