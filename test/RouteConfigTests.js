'use strict';

var proxyquire = require('proxyquire');

var sinon = require('sinon');
var assert = require('assert');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');

var routeConfig = proxyquire('../RouteConfig', {
    './route.config.json': sinon.stub(),
    './utils/authenticationMiddleware': sinon.stub(),
})