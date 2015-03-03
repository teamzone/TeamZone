'use strict';

var bcrypt = require('bcrypt');

function CryptService() {}

CryptService.prototype = bcrypt;

module.exports = CryptService;