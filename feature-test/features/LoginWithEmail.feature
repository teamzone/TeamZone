Feature:  Login to TeamZone with a email address and password
Our users (e.g. Coaches, Players, Admins, Managers, Vote Givers) will need to login to the site in order to do tasks that normal viewers of the site can't do like add players and give votes.

Background:

	Given We have the user, a coach, robdunn@aboutagile.com with name Rob, surname Dunn, and password AussieInternational registered on the system.
	
Scenario: The coach Rob Dunn needs to login to the website with a valid email and password

	Given We are on the login page
	When I enter robdunn@aboutagile.com into the login email field and AussieInternational in the password field
	Then he should be logged in successfully

Scenario: The coach Rob Dunn tries to login to the website with an invalid password

	Given We are back on the login page
	When I enter robdunn@aboutagile.com into the login email field and incorrect password NotAnAussieInternational in the password field
	Then he should not be logged in 
	And  notified by error message 'Incorrect Login Details Entered, please check your email and/or password'	
