var assert = require('assert');
//var webdriver = require('selenium-webdriver');
var English = require('yadda').localisation.English;
var dbHelpers = require('../../../feature-test/steps/common/DbHelpers');
var testutility = require('../common/TestUtility');
var tu = new testutility();

module.exports = (function() {
	
  return English.library()
	
	.given("^We use the login page to login to teamzone.  We are dependent on the user $email $firstname, $surname, $password being registered on the system.", function(email, firstname, surname, password, next) {	
	    var dbh = new dbHelpers(true);
        dbh.CreateUser(this.interpreter_context.usersDb, this.interpreter_context.createdUsers, firstname, surname, password, email, '', true, 
            function(err) {
                assert.ifError(err);
                console.log('User %s %s created', firstname, surname);
                next();
        });
    })
    
    .given("Our user $firstname $surname is on the Login Page", function(firstname, surname, next) {
        var driver = this.interpreter_context.driver;
        driver.get(process.env.TEAMZONE_URL + '/login');
        tu.waitForUrl(driver, process.env.TEAMZONE_URL + '/login', next);
    })
	
    .when("Enters $email into the login email field and $password in the password field", function(email, password, next) {
       enterUsernamePassword(this.interpreter_context.driver, email, password, next);
    })

    .then("$firstname $surname should be logged in successfully", function(firstname, surname, next) {
        next();
    })
	
    .given("be navigated away from the login page", function(next) {
        var driver = this.interpreter_context.driver;
        tu.waitForUrl(driver, process.env.TEAMZONE_URL + '/dashboard', 
                    function () { 
                         tu.logoutUser(driver, next); 
                    });     
    })

// Next scenario being tested
    .given("Our user $firstname $surname is back on the Login Page", function(firstname, surname, next) {
        tu.waitForUrl(this.interpreter_context.driver, process.env.TEAMZONE_URL + '/login', next);
    })
    
    .when("Enters $email into the login email field and incorrect $password in the password field", function(email, password, next) {
        enterUsernamePassword(this.interpreter_context.driver, email, password, next);  
    })
    
    .then("$firstname $surname should not be logged in ", function(firstname, surname, next) {
        next();
    })
	
    .given("be directed back to the login page with the login dialog showing error $errortext", function(errortext, next) {
        tu.waitForUrl(this.interpreter_context.driver, process.env.TEAMZONE_URL + '/login', next);
    })
    
})();

function enterUsernamePassword(driver, email, password, next) {
    driver.findElement(webdriver.By.name('username'))
        .then(function(userNameElement) {
            userNameElement.sendKeys(email);
            driver.findElement(webdriver.By.name('password'))
                .then(function(passwordElement) {
                    passwordElement.sendKeys(password);
                    driver.findElement(webdriver.By.name('Login'))
                        .then(function(loginElement) {
                            loginElement.click();
                            next();
                        })
                        .then(null, function(err) {
                            console.error("An error was thrown finding the Login button " + err);
                            assert.ifError(err);
                        })                                 
                    })
            .then(null, function(err) {
                console.error("An error was thrown finding the password textbox " + err);
                assert.ifError(err);
            })                    
        })  
        .then(null, function(err) {
            console.error("An error was thrown finding the username textbox " + err);
            assert.ifError(err);
        });
}