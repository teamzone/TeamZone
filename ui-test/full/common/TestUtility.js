var fs = require('fs');
var path = require('path');
var assert = require('assert');
var webdriver = require('selenium-webdriver');

/**
 * Utility functions for UI Testing
 */
function TestUtility() {
        
    /**
     * @name takeScreenshotOnFailure
     * @description places a screenshot in the screenshots folder of the running app 
     * @param driver selenium webdriver 
     */     
    this.takeScreenshotOnFailure = function(driver, test) {
        if (test.status != 'passed') {
            
            var scrpath = path.resolve(__dirname, 'screenshots/') + test.title.replace(/\W+/g, '_').toLowerCase() + '.png';
            driver.takeScreenshot().then(function(data) {
                fs.writeFileSync(scrpath, data, 'base64');
            });
        }
    };
    
    /**
     * @name setUpRemoteUITestTunnel
     * @description setup browserstack for UI testing 
     * @param webdriver selenium webdriver 
     * @returns live selenium driver connected to browserstack
     */        
    this.setUpRemoteUITestTunnel = function(webdriver) {
        
        var remoteUrl = process.env.UITEST_SERVER;
        desired = {
            'browserName' : process.env.UITEST_BROWSER,
            'browser_version' : process.env.UITEST_BROWSER_VERSION,
            'os' : process.env.UITEST_OS,
            'os_version' : process.env.UITEST_OS_VERSION,
            'resolution' : process.env.UITEST_RESOLUTION,   
            'browserstack.user' : process.env.UITEST_USERNAME,
            'browserstack.key' : process.env.UITEST_ACCESS_KEY,                     
            'browserstack.local' : process.env.UITEST_LOCAL_TEST,
            'browserstack.debug' : process.env.UITEST_DEBUG
        };       
        var driver = new webdriver.Builder().usingServer(remoteUrl).withCapabilities(desired).build();
        driver.manage().timeouts().implicitlyWait(10000);
        return driver;
    };

    /**
     * @name waitForUrl
     * @description tests can use this to wait for a Url to be displayed in a browser 
     * @param driver selenium webdriver 
     * @param urlPage wait until the URL changes to match this url
     * @param next async code pattern parameter for next code to execute
     * @exception assert an error for the test on failure
     */    
    this.waitForUrl = function (driver, urlPage, next) {
        this.waitForUrlToChangeTo(driver, urlPage)
            .then(function() {
                console.log('At the page ' + urlPage);
                next();
            })
            .then(function(err){
                assert.ifError(err);
            });                
    }

    /**
     * @name waitForUrlToChangeTo
     * @description Wait until the URL changes to match the url passed in
     *          Code modified from https://github.com/angular/protractor/issues/610
     * @param urlTest wait until the URL changes to match this url
     * @returns {!webdriver.promise.Promise} Promise
     */
    this.waitForUrlToChangeTo = function (driver, urlTest) {
        var currentUrl;
        console.log('Waiting for url to change to ' + urlTest);
        return driver.getCurrentUrl().then(function storeCurrentUrl(url) {
                currentUrl = url;
            }
        ).then(function waitForUrlToChangeTo() {
                return driver.wait(function waitForUrlToChangeTo() {
                    return driver.getCurrentUrl().then(function compareCurrentUrl(url) {
                        return urlTest === url;
                    });
                });
            }
        );
    }

    /**
     * @name logoutUser
     * @description Assume that the menu bar is visible for the logout id to be found and to click it and cause logging out
     * @param driver Selenium web driver
     * @param next async code pattern parameter for next code to execute
     * @returns {!webdriver.promise.Promise} Promise
     */    
    this.logoutUser = function(driver, next) {
        var tu = this;
        driver.findElement(webdriver.By.id('logout'))
            .then(function(logoutElement) {
                logoutElement.click();
                tu.waitForUrl(driver, process.env.TEAMZONE_URL + '/login', next);
            })
            .then(null, function(err) {
                console.error("An error was thrown trying to logout " + err);
                assert.ifError(err);
            });
    }
}

module.exports = TestUtility;
