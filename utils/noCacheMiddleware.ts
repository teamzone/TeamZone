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
 * Express Middleware that removes the cache if they are not authenticated.
 * @param {Request} req - The current Express request.
 * @param {Response} res - The Express response.
 * @param {Function} next - Function to invoke the next middleware.
 **/
var noCacheMiddleware : express.RequestHandler =  (req: express.Request, res: express.Response, next: Function) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
} 

module.exports = noCacheMiddleware;