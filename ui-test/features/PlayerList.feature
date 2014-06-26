Feature:  Player List
As a coach I should be able to list the players in my team

Background:	
	
	Given we have a team called Western Knights 1st Team for the season 2014 with players listed in the table
		
Scenario: The player list should be shown

	Given I have players to list
	when I have the details created in fixture setup
	then The player list should have 3 players listed

###
Leave commented out and do in code as Yadda can't do this yet as a test fixture setup

Where:
	 firstname	| surname	| dob			| address										| suburb		| postcode		| phone			| email			|
	 Mile		| Jedinak	| 3 Aug 1984	| Selhurst Park Stadium Whitehorse Lane 		| London 		| SE25 6PU		| 0432299934	| mile@wk.org	|
	 Luke		| Teal		| 3 Sep 1984	| Picmonova 9							 		| Zagreb 		| 10000			| 0442888999	| luke@wk.org	|
	 Ed			| Argent	| 3 Oct 1984	| Picmonova 9							 		| Zagreb 		| 10000			| 0442888999	| luke@wk.org	|

###	 