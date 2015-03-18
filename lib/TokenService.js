/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
"use strict";
/*
Sets up the token generator with the secret
*/

var token = require('token');

token.defaults.secret = 'ZZVV';
token.defaults.timeStep = 96 * 60 * 60; // 96h in seconds

function TokenService() {
    console.log('Tokenservuce is created');
}

TokenService.prototype = token;

module.exports = TokenService;