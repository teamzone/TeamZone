Feature:  Add a Player
To be able to contact our players, as a coach I’d like to add player names and address details into the system

Background:

	Given we have a team called Western Knights 1st Team for the season 2014 with no players listed
	
Scenario: The player vital details need to be entered

	Given I have an empty Player List
	when I enter vital details [firstname], [surname], [dob], [address], [suburb], [postcode] 
	then The player list should have 1 player listed

Where:
	 firstname	| surname	| dob		| address							| suburb			| postcode 	
	 Mile		| Jedinak	| 3 Aug 1984	| Selhurst Park Stadium Whitehorse Lane 	| London 		| SE25 6PU	
	 
Scenario: The player First Name, Address and Postcode is not entered

	When I ask to save some missing values [firstname], [surname], [dob], [address], [suburb], [postcode]
	Then I should be alerted that first Name, address and postcode should be entered
	And no information will be saved
	 
Where:
	 firstname	| surname	| dob			| address							| suburb			| postcode 	
	 			| Warren	| 3 Aug 1984	| 									| London 			| 
