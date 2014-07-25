function PlayerManagementService() {

    // Sets up the database to default settings
    this.Open = function(db, leveldbArg) {
    }

    this.AddPlayer = function(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback) {
        callback(new Error('Database Access failed'));        
	}

	this.GetPlayer = function(teamname, firstname, surname, callback) {
        callback();
	}

    this.DeletePlayers = function(callback) {
        callback();
    }

}

module.exports = PlayerManagementService;