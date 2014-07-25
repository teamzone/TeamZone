Feature:  Add a Player
To be able to contact our players, as a coach I’d like to add player names and address details into the system

Background:

	Given we have a team called Western Knights 1st Team for the season 2014 with no players listed
	
Scenario: The player vital details need to be entered

	Given I have an empty Player List
	when I enter vital details [firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email] 
	then The player list should have 1 player listed

Where:
	 firstname	| surname	| dob			| address									| suburb			| postcode 		| phone			| email
	 Mile		| Jedinak	| 3 Aug 1984	| Selhurst Park Stadium Whitehorse Lane 	| London 			| SE25 6PU		| 0404 099 081	| mile@wk.com.au
	 Tim		| Cahill	| 3 Aug 1983	| Red Bull Arena Cape May St			 	| Harrison 			| NJ 07029		| 0404 099 133	| tim@wk.com.au
	 Mark		| Bresciano	| 11 Feb 1980	| Thani bin Jassim Stadium				 	| Doha	 			| Doha			| 0402 129 329	| mark@wk.com.au
	 Luke		| Wilkshire	| 2 Oct 1981	| Arena Khimki ul. Valutina				 	| Moskovskaya oblast| Moscow		| 0412 873 729	| luke@wk.com.au

Scenario: Repeating the same player details for an already exisiting player should be disallowed

	Given I have a Player List with the following details [firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email]
	when I enter those details again 
	then saving should not be permitted and the user notified	 

Where:
	 firstname	| surname	| dob			| address									| suburb			| postcode 		| phone			| email
	 John		| Warren	| 3 Aug 1954	| 1 Pitt Street								| Sydney			| 2000			| 0414 199 181	| john@wk.com.au

Scenario: Entering an invalid date should be disallowed

	Given As a coach 
	when I attempt to enter the following details which contains an incorrect date [firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email]
	then I should be notified of an invalid date

Where:
	 firstname	| surname	| dob			| address									| suburb			| postcode 		| phone			| email
	 Mark		| Viduka	| 3 MMM 1974	| 1 Edensor Street							| Edensor Park		| 2101			| 0424 299 281	| marko@wk.com.au
