#!/bin/bash
# Start up an instance of Selenium Server
java -jar ./Selenium/selenium-server-standalone-2.42.2.jar -port 4444 -interactive &
#start up the application
node app &
export DISPLAY=:99
/etc/init.d/xvfb start
mocha -t 11000 -R spec ./ui-test/full/steps/testAddPlayer.js
RESULT=$?
/etc/init.d/xvfb stop
exit $RESULT
