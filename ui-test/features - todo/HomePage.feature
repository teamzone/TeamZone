Feature:  Home Page
The Home Page should display various information like user name, primary team for a logged in user

Background:

	Given we have a users the home page should display various details
	
Scenario: Display user first name and surname and primary team

	Given I have logged in as [user]
	when the home page is displayed
	then [firstname] [surname] [primaryteam] should be displayed

Where:
	 user		| firstname	| surname		| primaryteam					| 
	 mdunn		| Mike		| Dunn			| Western Knights 1st Team 		| 
	 ahunt		| Andy		| Hunt			| Western Knights Reserves Team |
	 