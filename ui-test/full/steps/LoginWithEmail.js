var assert = require('assert');
var webdriver = require('selenium-webdriver');
var English = require('yadda').localisation.English;
var dbHelpers = require('../../../feature-test/steps/common/DbHelpers');

module.exports = (function() {
	

  return English.library()
	
	.given("^We use the login page to login to teamzone.  We are dependent on the user $email $firstname, $surname, $password being registered on the system.", function(email, firstname, surname, password) {	
	    var dbh = new dbHelpers();
        dbh.CreateUser(this.interpreter_context.usersDb, this.interpreter_context.createdUsers, firstname, surname, password, email, '', true, 
            function(err) {
                assert.ifError(err);
                console.log('User %s %s created', firstname, surname);
        });
    })
    
    .given("Our user $firstname $surname is on the Login Page", function(firstname, surname) {
       var driver = this.interpreter_context.driver;
       driver.get(process.env.TEAMZONE_URL + '/login');
       //wait til fully loaded before attempting to locate items
       var isDisplayed = driver.wait(function() {
            					var canSee = driver.findElement(webdriver.By.name('username')).isDisplayed();
            					return canSee;
       					 }, 10000);
	   assert(isDisplayed, 'Page not displayed');
    })
	
    .when("Enters $email into the login email field and $password in the password field", function(email, password) {

       var driver = this.interpreter_context.driver;
	   
       driver.findElement(webdriver.By.name('username'))
            .then(function(userNameElement) {
                userNameElement.sendKeys(email);
                driver.findElement(webdriver.By.name('password')).sendKeys(password);
                driver.findElement(webdriver.By.name('Login')).click();
                return true;
        })
        .then(null, function(err) {
            console.error("An error was thrown! " + err);
            assert.ifError(err);
        });
  	   	   
    })

    .then("$firstname $surname should be logged in successfully", function(firstname, surname) {

    })
	
    .given("be navigated away from the login page", function() {
        var driver = this.interpreter_context.driver;
        //var createdUser = this.interpreter_context.createdUsers[this.interpreter_context.createdUsers.length - 1];
        //the next page should be the dasboard
       var isDisplayed = driver.wait(function() {
                                return driver.getCurrentUrl().then(function(currentUrl) {
            					    var position = currentUrl.indexOf('dashboard');
            					    return position > -1;
                                });
       					 }, 10000);
	   assert(isDisplayed, 'Page not displayed');
    })

// Next scenario being tested
    .given("Our user $firstname $surname is back on the Login Page", function(firstname, surname) {
      
    })
    
    .when("Enters $email into the login email field and incorrect $password in the password field", function(email, password) {
       
    })
    
    .then("$firstname $surname should not be logged in ", function(firstname, surname) {

    })
	
    .given("be directed back to the login page with the login dialog showing error 'Login failed.  You may need to still verify your account or incorrect username/password was entered'", function() {

    })
    
})();
