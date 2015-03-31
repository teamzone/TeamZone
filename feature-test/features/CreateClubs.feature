Feature:  We extend the feature Create Club for a multiple user situation that we expect in real life.  Multiple users will be creating clubs at any one time.
The website should be able to handle this load otherwise it becomes useless.

Background:
	
	Given There will be several users as specified in our test user file ../features/CreateClubs.json who are creating clubs. The user details are in fields adminemail, adminfirstname, adminlastname, adminpassword
		
Scenario: The user creates a club, they will become the administrator of that club.
	
	Given adminemail gives the club name clubname located at fieldname in the suburb of suburbname in the city of cityname
	When the club is saved
	Then the adminemail will also be the administrator of the club