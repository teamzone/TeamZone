Feature:  Administrators will need to be able to create a club so squads can be created for the club like the squad for the Premier League Team and the Reserves Team.  
For some further background, players can be selected from a squad (for a season) for differing teams on a week by week basis.
Having a squad allows players to be added and removed.  The concepts such as squads, teams, players and clubs are covered in other features.
Starting a club means they automatically become the administrator.

Background:
	
	Given The user Mel Taylor-Gainsford is logged into the site.  
		
Scenario: The user creates a club, they will become the administrator of that club.
	
	Given User gives the club name Western Knights located at Nash Field in the suburb of Mosman Park in the city of Perth
	When the club is saved
	Then the user will also be the administrator of the club
