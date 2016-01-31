/*jslint node: true */
/*jslint newcap: true */
/*jslint nomen: true */
"use strict";
var bcrypt = require('bcrypt');

function CryptService() {
    console.log('Created the CryptService');
}

CryptService.prototype = bcrypt;

module.exports = CryptService;