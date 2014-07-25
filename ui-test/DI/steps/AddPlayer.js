/* jslint node: true */
"use strict";

var webdriver = require('selenium-webdriver');
var assert = require('assert');
var Yadda = require('yadda');

module.exports = (function() {

    var library = new Yadda.localisation.English.library()
    
    .given("As a coach or administrator who wants to Add Players", function() {
        var pmsStub = this.ctx.pmsStub;
        
    })

    .when("an error occurs when submitting these valid player details $firstName, $surname, $dob, $address, $suburb, $postcode, $phone, $email", function(firstname, surname, dob, address, suburb, postcode, phone, email) {
        //let's save the data for use later
        this.ctx.player = { firstname: firstname, surname: surname, dob: dob, address: address, suburb: suburb, postcode: postcode, phone: phone, email: email };
        StandardAddPlayerFormFill(this.ctx.driver, this.ctx.teamname, firstname, surname, dob, address, suburb, postcode, phone, email);
    })

    .then("the user should be notified with the message 'A failure occurred whilst saving the player. Please try again'", function() {
       var driver = this.ctx.driver;
       var ctx = this.ctx;
       
       ////TODO: Parameterize the URL
       driver.getCurrentUrl().then(function(url) {
       assert.equal(url, 'http://localhost:3000/addPlayer', 'Should be on the AddPlayer page still, however it is ' + url);

        var alert = driver.switchTo().alert();
        alert.getText().then(function(text) {
          assert.equal('Error during adding the player.  Please try again', text, 'Alert text not present')
          alert.accept();
        });

       });
      
    })

    .then("the form should appear as prior to the submission ready for the user to try again", function() {
        var driver = this.ctx.driver;
        var ctx = this.ctx;

        driver.findElement(webdriver.By.name('TeamName')).then(function(teamNameElement) {
            //checking that the data that was entered previously is still there

            teamNameElement.getAttribute('value').then(function(value) {
                assert.equal(value, ctx.teamname, value + ' is not present');
            });

            return true;
        });
      
    })

    function StandardAddPlayerFormFill(driver, teamname, firstname, surname, dob, address, suburb, postcode, phone, email)
    {
       //TODO: Parameterize the URL
       driver.get("http://localhost:3000/addPlayer");

       //wait til fully loaded before attempting to locate items
       driver.wait(function() {
            return driver.findElement(webdriver.By.name('TeamName')).then(function(element) { return element !== null});
       }, 10000);

       driver.findElement(webdriver.By.name('TeamName'))
            .then(function(teamNameElement) {

                driver.findElement(webdriver.By.name('TeamName')).sendKeys(teamname);
                driver.findElement(webdriver.By.name('FirstName')).sendKeys(firstname);
                driver.findElement(webdriver.By.name('Surname')).sendKeys(surname);
                driver.findElement(webdriver.By.name('DOB')).sendKeys(dob);
                driver.findElement(webdriver.By.name('Address')).sendKeys(address);
                driver.findElement(webdriver.By.name('Suburb')).sendKeys(suburb);
                driver.findElement(webdriver.By.name('PostCode')).sendKeys(postcode);
                driver.findElement(webdriver.By.name('Phone')).sendKeys(phone);
                driver.findElement(webdriver.By.name('Email')).sendKeys(email.trim());
                driver.findElement(webdriver.By.name('Submit')).click();

                return true;
        })
        .then(null, function(err) {
            console.error("An error was thrown! " + err);
            assert.ifError(err);
        });

    }

    return library;
})();
