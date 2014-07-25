Feature:  Add a Player
To be able to contact our players, as a coach I’d like to add player names and address details into the system

Background:

	Given we have a team called Western Knights 1st Team for the season 2014 with no players listed
	
Scenario: The player vital details need to be entered

	Given I have an empty Player List
	when I enter vital details [firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email] 
	then The player list should have [firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email] listed

Where:
	 firstname	| surname	| dob			| address									| suburb			| postcode 		| phone			| email
	 Mile		| Jedinak	| 3 Aug 1984	| Selhurst Park Stadium Whitehorse Lane 	| London 			| SE25 6PU		| 0404 099 081	| mile@wk.com.au
	 Tim		| Cahill	| 3 Aug 1983	| Red Bull Arena Cape May St			 	| Harrison 			| NJ 07029		| 0404 099 133	| tim@wk.com.au
	 Mark		| Bresciano	| 11 Feb 1980	| Thani bin Jassim Stadium				 	| Doha	 			| Doha			| 0402 129 329	| mark@wk.com.au
	 Luke		| Wilkshire	| 2 Oct 1981	| Arena Khimki ul. Valutina				 	| Moskovskaya oblast| Moscow		| 0412 873 729	| luke@wk.com.au

