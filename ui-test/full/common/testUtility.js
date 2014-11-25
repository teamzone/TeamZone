var fs = require('fs');
var path = require('path');

function executeInFlow(webdriver, fn, done) {
    webdriver.promise.controlFlow().execute(fn).then(function() {
        done();
    }, done);
}

function takeScreenshotOnFailure(driver, test) {
    if (test.status != 'passed') {
        
        var scrpath = path.resolve(__dirname, 'screenshots/') + test.title.replace(/\W+/g, '_').toLowerCase() + '.png';
        driver.takeScreenshot().then(function(data) {
            fs.writeFileSync(scrpath, data, 'base64');
        });
    }
}