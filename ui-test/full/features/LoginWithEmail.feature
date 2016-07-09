Feature:  Login to TeamZone with a email address and password
Our users (e.g. Coaches, Players, Admins, Managers, Vote Givers) will need to login to the site in order to do tasks that normal viewers of the site can't do like
add players and give votes.

Background:

	Given We use the login page to login to teamzone.  We are dependent on the user robdunn@aboutagile.com rob, dunn, AussieInternational being registered on the system.
	
Scenario: The coach Rob Dunn needs to login to the website with a valid email and password. He will want to manage his team Western Knights 1st Team

	Given Our user Rob Dunn is on the Login Page
	When Enters robdunn@aboutagile.com into the login email field and AussieInternational in the password field
	Then Rob Dunn should be logged in successfully
	And be navigated away from the login page

Scenario: The coach Rob Dunn tries to login to the website with an invalid email and password

	Given Our user Rob Dunn is back on the Login Page
	When Enters robdunn@aboutagile.com into the login email field and incorrect NotAnAussieInternational in the password field
	Then Rob Dunn should not be logged in 
	And be directed back to the login page with the login dialog showing error 'Incorrect Login Details Entered, please check your email and/or password'