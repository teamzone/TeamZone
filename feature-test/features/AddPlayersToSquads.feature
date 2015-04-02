Feature:  What about if an administrator of a club wants to allocate players to squads.  It will be faster that way.  A user could drop players in various squads.

Background:
	
	Given The coach Ken Court is logged into the site and is a coach for Western Knights in Perth and is allocating players to squads, 1st Team and Reserves, for season 2015.  
		
Scenario: The coach wants to select players for squads he controls.
	
	Given A list of players at the club
	When the coach selects player [firstname], [surname], [dob], [email]
	And chooses to add them to the [squad]
	Then the coach will have [firstname], [surname], [email] listed as players in the [squad]

	Where:

	squad		| firstname	| surname	| dob			| email
	1st Team 	| Mile		| Jedinak	| 3 Aug 1984	| mile@wk.com.au
	1st Team	| Tim 		| Cahill 	| 3 Aug 1985	| tim@wk.com.au
	Reserves	| Ken 		| Clay	 	| 13 July 1986	| ken@wk.com.au
	Reserves	| Adam 		| Pile	 	| 11 Nov 1987	| adam@wk.com.au
	1st Team 	| Joe		| Skoko		| 14 June 1985	| joe@wk.com.au
	1st Team	| Simon		| Broad 	| 30 Aug 1988	| simon@wk.com.au
	Reserves	| Milton 	| Cay	 	| 13 Jan 1989	| milton@wk.com.au
	Reserves	| River		| Plate	 	| 17 Nov 1989	| river@wk.com.au
	1st Team 	| Lionel	| Derti		| 6 May 1991	| lionel@wk.com.au
	Reserves	| Greg 		| Keith	 	| 11 Nov 1998	| greg@wk.com.au
	1st Team 	| Jim		| Carr		| 14 June 1985	| jim@wk.com.au
	1st Team 	| Jack		| Jackson	| 14 Feb 1992	| jack@wk.com.au