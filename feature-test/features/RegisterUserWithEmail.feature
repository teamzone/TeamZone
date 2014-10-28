Feature:  Register as a user on TeamZone with an email address and password

Our users (e.g. Coaches, Players, Admins, Managers, Vote Givers) will need to register on the site in order to do tasks that normal viewers of the site can't do like
setup teams, add players and give votes.

Background:

	Given We visit the register user page on the site. 
	
Scenario: The administrator Mary Kovacs wants to register on the website. She will need to eventually be able to setup teams and add players.

	Given We are on on the register as a user page and choose to register with an email and a password
	When I enter marykovacs@aboutagile.com into the email field and GoKnights in the password field and click the Register button
	Then Mary Kovacs will be sent a validation email.  No other details are required until the email is validated.

Scenario: The administrator May Kovacs is already registered on the website so should not be able to register again

	Given We are on on the register as a user page and choose to register with an email and a password
	When I enter marykovacs@aboutagile.com into the email field and GoKnights in the password field and click the Register button
	Then Mary Kovacs will be told that she is already registered.  She should be told to use the login button on the home page to login
	
## Student's could work on the other scenarios we come up with or tey come up with ?
##