var assert = require('assert'); // built-in node lib
var Pms = require('../lib/PlayerManagementService'); // The library that you wish to test
var sinon = require('sinon');

/// <reference path="PlayerManagementService.js" />

describe("Player Management Service Validation Unit Tests", function() {
  
  var pms = new Pms();

  it("Validate should handle multiple validation and throw one error for all", function() {

      try
      {
        pms.Validate("Test Team", null, "Test Surname", "1/1/2001", null, "Moolabah", null, null, null);
      } catch (e)
      {
        //assert.ok(e instanceof Pms.ValidationError(), "Expecting the validation error type");
        assert.ok(e.Errors.indexOf("firstname is not present") > -1, "address should have been validated");
        assert.ok(e.Errors.indexOf("address is not present") > -1, "address should have been validated");
        assert.ok(e.Errors.indexOf("postcode is not present") > -1, "postcode should have been validated");
        assert.ok(e.Errors.indexOf("phone is not present") > -1, "phone should have been validated");
        assert.ok(e.Errors.indexOf("email is not present") > -1, "email should have been validated");
        return;
      } 
      assert.fail(1, 0, "Not expecting to get here"); 
  });
    
  it("Validate should handle multiple validation not throw an error when all Ok", function() {
      pms.Validate("Test Team", "Test Name", "Test Surname", "1/1/2001", "Test Address", "Moolabah", "4059", "09722722", "test@aa.com");
  });
      
});