Feature:  Add a Player
To be able to contact our players, as a coach I’d like to add player names and address details into the system

Scenario: When a failure occurs from the server I should be told about it

	Given As a coach or administrator who wants to Add Players 
	when an error occurs when submitting these valid player details [firstname], [surname], [dob], [address], [suburb], [postcode], [phone], [email] 
	then the user should be notified with the message 'A failure occurred whilst saving the player. Please try again' 
	and the form should appear as prior to the submission ready for the user to try again

Where:
	 firstname	| surname	| dob			| address									| suburb			| postcode 		| phone			| email
	 Mark		| Viduka	| 3 Dec 1974	| 1 Edensor Street							| Edensor Park		| 2101			| 0424 299 281	| marko@wk.com.au
