Feature:  Anyone charged with managing a club needs to looks after many players.  It is common to organise players into squads that align with their age group or the league they 
are most likely to be playing in.  By using this feature, one can create a squad and later on be able to add and remove players from the squad.  
Squads should also be unique within the club and city and also for a season.  Therefore a squad needs to be created with a season.  These are kept separate data, squad name and season,
for easier linking to details of the season.

Background:
	
	Given The user Mel Taylor-Gainsford is logged into the site and is an administrator for the club Western Knights in Perth playing at Nash Field in Mosman Park for the current season.  
		
Scenario: The user creates a squad.
	
	Given User gives the squad name Reserves Team and an age limit of unrestricted
	When the squad is saved
	Then the user will also be marked as the creator of the squad

