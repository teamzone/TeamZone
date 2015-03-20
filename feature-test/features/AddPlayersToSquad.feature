Feature:  Anyone charged with managing a club needs to looks after many players.  It is common to organise players into squads that align with their age group or the league they 
are most likely to be playing in.  We can create squads through the Create Squad feature, but this is only half the job.  This feature completes the picture as it will allow the
user to add players from a pool of players already registered with the club to a squad.  A squad is the primary organising mechanism for a coach to select players for a team or
teams.  It helps the coach know who his players are and the age brackets they belong in.  Anyone else using the site will be able to see this as well.

Background:
	
	Given The coach Ken Court is logged into the site and is a coach for Western Knights in Perth and is looking after two squads 1st Team and Reserves for the 2015 season.  
		
Scenario: The coach wants to select players for his squad and allow players over 16 years of age.
	
	Given A list of older players playing at the club
	When the coach selects player [firstname], [surname], [dob], [email]
	And chooses to add them to the 1st Team squad
	Then the coach will have [firstname], [surname], [email] listed as players as they conform to the age limit

	Where:

	firstname	| surname	| dob			| email
	Mile		| Jedinak	| 3 Aug 1984	| mile@wk.com.au
	Tim 		| Cahill 	| 3 Aug 1985	| tim@wk.com.au
	
Scenario: Selecting and attempting to add players under 16 years of age should reject those players.
	
	Given A list of younger players playing at the club
	When the coach selects an underage player [firstname], [surname], [dob], [email]
	And wants to add them to the Reserves squad
	Then [firstname], [surname], [email] will be rejected as being too young
	
Where:
	 firstname	| surname	| dob			| email
	 Ivan		| Jedinak	| 13 Dec 2009	| ivanj@wk.com.au
	 Timmy		| Cahill 	| 3 Aug 2010	| timmy@wk.com.au
	 
