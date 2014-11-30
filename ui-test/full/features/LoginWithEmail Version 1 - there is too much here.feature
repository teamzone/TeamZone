Feature:  Login to TeamZone with a email address and password
Our users (e.g. Coaches, Players, Admins, Managers, Vote Givers) will need to login to the site in order to do tasks that normal viewers of the site can't do like
add players and give votes.

Background:

	Given We visit the home page of the site and wish to login through the login area.  We are dependent on the user being registered on the system.
	
Scenario: The coach Rob Dunn needs to login to the website with a valid email and password

	Given We are on on the home page and choose to login through the Login button we end up at the Login Page
	When I enter robdunn@aboutagile.com into the login email field and AussieInternational in the password field
	Then Rob Dunn should be logged in successfully
	And by be presented with the list of teams he coaches which is Western Knights 1st Team

Scenario: The coach Rob Dunn tries to login to the website with an invalid email and password

	Given We are on on the home page
	When I enter robdunn@aboutagile.com into the login email field and NotAnAussieInternational in the password field
	Then Rob Dunn should not be logged in 
	And by directed back to the home page with the login dialog showing error 'Login failed.  You may need to still verify your account or incorrect username/password was entered'