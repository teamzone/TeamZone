Feature:  Login to TeamZone with a email address and password
Our users (e.g. Coaches, Players, Admins, Managers, Vote Givers) will need to login to the site in order to do tasks that normal viewers of the site can't do like add players and give votes.

Background:

# Perhaps make the 2nd sentence a little more "english"?
	Given We visit the home page of the site and wish to login through the login area.  We are dependent on the user robdunn@aboutagile.com rob, dunn, AussieInternational being registered on the system.
	
Scenario: The coach Rob Dunn needs to login to the website with a valid email and password

# Note: This should match the flow of the website - hit login page first; there isn't a 'login area'
	Given We are on the home page
	When I enter robdunn@aboutagile.com into the login email field and AussieInternational in the password field
	Then he should be logged in successfully
	And be presented with the list of teams he coaches which is Western Knights 1st Team

Scenario: The coach Rob Dunn tries to login to the website with an invalid password

	Given We are back on the home page
	When I enter robdunn@aboutagile.com into the login email field and incorrect password NotAnAussieInternational in the password field
	Then he should not be logged in 
	And  notified by error message 'Incorrect Login Details Entered, please check your email and/or password'	
