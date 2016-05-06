/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/express-validator/express-validator.d.ts' />
/// <reference path='../typings/express/express.ext.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/*jslint nomen: true */
'use strict';

import express = require("express");

/**
 * Express Middleware that redirects the client to the login url if they are not authenticated.
 * @param {Request} req - The current Express request.
 * @param {Response} res - The Express response.
 * @param {Function} next - Function to invoke the next middleware.
 **/
var authenticationMiddleware : express.RequestHandler =  (req: express.Request, res: express.Response, next: Function) => {
    console.log('Request to: ' + req.url + " handled by auth middleware");
    var authenticated = req.session.authenticated;
    
    if(authenticated) {
        return next();
    }
    
    res.redirect('/login?url=' + req.url);
} 

module.exports = authenticationMiddleware;