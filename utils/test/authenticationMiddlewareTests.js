'use strict';

var sinon = require('sinon');
var assert = require('assert');
var sinonChai = require("sinon-chai");
var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
require('mocha-sinon');
var authenticationMiddleware = require('../authenticationMiddleware');

describe('authenticationMiddleware', function() {
   
   
   var authenticatedRequest = {
       session: {
           authenticated: true
       },
       url: '/addPlayer'
   };
   var unauthenticatedRequest = {
       session: {
           
       },
       url: '/addPlayer'
   };
   
   var response = {};
   
   var next;
   
   beforeEach(function() {
       next = sinon.spy();
       response.redirect = sinon.spy();
   });
   
   it('passes through if the user is authenticated', function(done) {
      // 2. exercise
      authenticationMiddleware(authenticatedRequest, response, next);
      
      // 3. verify
      expect(next.called).to.equal(true);
      
      // 4. teardown
      done(); 
   });
   
   it('redirects to /login if the user is not authenticated', function(done) {
       // 2. exercise
       authenticationMiddleware(unauthenticatedRequest, response, next);
       
       // 3. verify
       expect(next.called).to.equal(false);
       expect(response.redirect.calledWith('/login?url=/addPlayer')).to.equal(true);
       
       // 4. teardown
       done();
   });
});