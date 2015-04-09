Feature:  This is a special feature of the Add Players to Squads.  It needs to correctly store the data for multiple clubs, squads and players and then be able to retrieve 
them correctly.  

##
## Test data is coming from a file.  The details of the file like names of fields are within the code for the fixture.  We toyed with the idea of specifying field names here
## as it could add to the narrative.  However we think it doesn't add any more meaning so we leave it out except for some key fields in the scenario text
##

Background:

	Given There will be several users as specified in our test user file ../features/AddPlayersToSquads.NonFunc.smalldataset.json with details of players for squads for a club. 
		
Scenario: The user adds players for a club.
	
	Given User chooses a player to add to a squad within a club
	When saved
	Then the player will be in the squad for the club as specified in the data file
