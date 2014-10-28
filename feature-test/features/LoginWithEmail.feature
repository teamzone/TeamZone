Feature:  Login to TeamZone with a email address and password
Our users (e.g. Coaches, Players, Admins, Managers, Vote Givers) will need to login to the site in order to do tasks that normal viewers of the site can't do like add players and give votes.

Background:

	Given We visit the home page of the site and wish to login through the login area.  We are dependent on the user robdunn@aboutagile.com rob, dunn, exsocceroo being registered on the system.
	
Scenario: The coach Rob Dunn needs to login to the website with a valid email and password

	Given We are on on the home page
	When I enter robdunn@aboutagile.com into the login email field and AussieInternational in the password field
	Then he should be logged in successfully
	And be presented with the list of teams he coaches which is Western Knights 1st Team