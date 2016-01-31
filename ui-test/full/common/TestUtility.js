var fs = require('fs');
var path = require('path');

function TestUtility() {
    
    this.executeInFlow = function(webdriver, fn, done) {
        webdriver.promise.controlFlow().execute(fn).then(function() {
            done();
        }, done);
    };
    
    this.takeScreenshotOnFailure = function(driver, test) {
        if (test.status != 'passed') {
            
            var scrpath = path.resolve(__dirname, 'screenshots/') + test.title.replace(/\W+/g, '_').toLowerCase() + '.png';
            driver.takeScreenshot().then(function(data) {
                fs.writeFileSync(scrpath, data, 'base64');
            });
        }
    };
    
    this.setUpRemoteSauceLabsTunnel = function(webdriver, desired) {
        
        var remoteUrl = "http://ondemand.saucelabs.com:80/wd/hub";
        var driver = new webdriver.Builder().usingServer(remoteUrl).withCapabilities(desired).build();
        driver.manage().timeouts().implicitlyWait(10000);
        return driver;
    
    };
    
    this.parseSauceLabsSettingsFromEnvironment = function(tags) {
        // checking sauce credential
        if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
            console.warn(
                '\nPlease configure your sauce credential:\n\n' +
                'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
                'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
            );
            throw new Error("Missing sauce credentials");
        }
        
        var desired = JSON.parse(process.env.DESIRED || '{"browserName": "firefox"}');
        desired.name = 'example with ' + desired.browserName;
        desired.tags = tags;
        desired.username = process.env.SAUCE_USERNAME;
        desired.accessKey = process.env.SAUCE_ACCESS_KEY;        
        return desired;
    };
}

module.exports = TestUtility;
