Feature:  We extend the feature CreateSquadsForClubsForSeason for a multiple user situation that we might expect in real life.  Multiple users will be creating clubs and squads at any one time.
The website should be able to handle this load otherwise it becomes useless.  It should handle retreival as well without issues.

##
## Test data is coming from a file.  The details of the file like names of fields are within the code for the fixture.  We toyed with the idea of specifying field names here
## as it could add to the narrative.  However we think it doesn't add any more meaning so we leave it out except for some key fields in the scenario text
##

Background:

	Given There will be several users as specified in our test user file ../features/CreateSquadsForClubsForSeason.json with details of squads for a club. 
		
Scenario: The user creates a squad for a club.
	
	Given User gives the squad a name of squadname and an age limit of agelimit for the season season
	When the squad is saved
	Then the user will also be marked as the creator of the squad
