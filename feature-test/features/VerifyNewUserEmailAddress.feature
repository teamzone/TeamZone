Feature:  A user has registered on the TeamZone website and received a verification email
A new user has registered.  Upon registering they are automatically sent an email with a link in it.  
By clicking on the link or copying it into a browser address bar, the user can confirm that it was them that registered on the website.

Background:

	Given The user Luke Teal has already registered on TeamZone with email address luke@aboutagile.com. 
	
Scenario: The player Luke Teal has registered on the website. He cannot gain full access to the site until has verified his email address.

	Given that Luke Teal clicks on the link and open a browser to navigate to the link
	When the browser sends the request to TeamZone
	Then Luke Teal is confirmed as a real user
	And should be notified in the browser that they have successfully registered 
	And receive an email confirming this
	And can now access the site

##Scenario: The player Luke Teal has already registered on the website. 
##
##	Given Luke Teal clicks on the link again and opens a browser to navigate to the link
##	When the browser sends the request to TeamZone
##	Then the request should be ignored
##  And Luke Teal should be notified that they have already registered and need not do that again
	
## Student's could work on the other scenarios we come up with or tey come up with ?
##