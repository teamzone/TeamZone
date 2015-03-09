Feature:  Anyone charged with managing a club needs to looks after many players.  It is common to organise players into squads that align with their age group or the league they 
are most likely to be playing in.  We can create squads through the Create Squad feature, but this is only half the job.  This feature completes the picture as it will allow the
user to add players from a pool of players already registered with the club to a squad.  A squad is the primary organising mechanism for a coach to select players for a team or
teams.  It helps the coach know who his players are and the age brackets they belong in.  Anyone else using the site will be able to see this as well.

Background:
	
	Given The coach Ken Court is logged into the site and is a coach for Western Knights in Perth and is looking after two squads First Team and Reserves for the 2015 season.  
		
Scenario: The coach wants to select players for his squad and there should not be an age limit except for being over 16 years of age.
	
	Given A list of players playing at the club
	When the coach selects players ([firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email])
	And chooses to add them to the First Team squad
	Then the coach will only have Mile Jedinak listed as a player as he conforms to the age limit
	
Where:
	 firstname	| surname	| dob			| address									| suburb			| postcode 		| phone			| email
	 Mile		| Jedinak	| 3 Aug 1984	| Selhurst Park Stadium Whitehorse Lane 	| London 			| SE25 6PU		| 0404 099 081	| mile@wk.com.au
	 Timmy		| Cahill 	| 3 Aug 2010	| Red Bull Arena Cape May St			 	| Harrison 			| NJ 07029		| 0404 099 133	| timmy@wk.com.au

