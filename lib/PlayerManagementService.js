//PlayerManagementService
//	NodeJs implementation for Player Management Data Services
var assert = require('assert');
var connection = 'DefaultEndpointsProtocol=https;AccountName=teamzone;AccountKey=7UqeAwGh/stbGPwOdJXLpCJ/T5JYhAlIEWBTE5U+vLZdiEJ0/YTOfRO4qBmVh4bAAcB0NrvljkrE7OfOpY8lXQ=='
var levelup = require('levelup');
var LevelAzureDown = require('azureleveldown');
var db = levelup(connection, {
  // the 'db' option replaces LevelDOWN
  db: function (connection) { 
    return new LevelAzureDown(connection) 
  }
})

module.exports = function() {

    this.AddPlayer = function(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback) {

		Validate(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback);	
								
		db.put(keyMaker(teamname, firstname, surname), JSON.stringify({ dob: dob, address: address, suburb: suburb, postcode: postcode, phone: phone, email: email }), { sync: true }, 
					function (err) {
						if (err) 
                            callback(null, err);
                        else
                            //it works nothing to return
                            callback(null, null);
				    }
			  );
        
	}

	this.GetPlayer = function(teamname, firstname, surname, callback) {
		db.get(keyMaker(teamname, firstname, surname), function (err, value) { 
					callback(value, err);
				});
	}
	
    this.GetPlayers = function(teamname, callback) {
        var startKey = teamname + '~';
        var endKey = teamname + '~~';
        var items = new Array();
		db.createReadStream({start: startKey, end: endKey})
            .on('data', function(data) {

                var keysplits = data.key.split('~');
                var attributes = JSON.parse(data.value);
                var player = {
                    "team": keysplits[0],
                    "firstname": keysplits[1],
                    "surname": keysplits[2],
                    "address": attributes.address,
                    "dob": attributes.dob,
                    "suburb": attributes.suburb,
                    "postcode": attributes.postcode,
                    "phone": attributes.phone,
                    "email": attributes.email
                };
                items[items.length] = player;
            })
            .on('error', function(err) {
                callback(items, err);
            })
            .on('close', function() {
                console.log('The items are ready.  There are %s or them', items.length);
                console.log(items);
                callback(items, null);
            });

    }

    this.Delete = function(teamname, firstname, surname, callback) {
       db.get(keyMaker(teamname, firstname, surname), function (errGet, value) { 
	        if (errGet == null && value !== null)
            {				    
			    db.del(keyMaker(teamname, firstname, surname), { sync: true }, 
					function (errDel) {
						if (errDel) callback(null, errDel);
                        //it works nothing to return
                        callback(null, null);
				    }
			    );
            }
            else
            {
                // Get failed nothing to do then - Key wasn't there
                callback(null, null)
            }
       }); 

    }

	this.Close = function() {
		db.close();
	}
	
    function keyMaker(teamname, firstname, surname)
    {
        return "".concat(teamname, "~", firstname, "~", surname, "~")
    }

	function Validate(teamname, firstname, surname, dob, address, suburb, postcode, phone, email, callback)
	{
		console.log('Validating the player');

        var errorCollection = null;
		
		errorCollection = assertNonBlankC(teamname, "teamname", errorCollection);
		errorCollection = assertNonBlankC(firstname, "firstname", errorCollection);
		errorCollection = assertNonBlankC(surname, "surname", errorCollection);
		errorCollection = assertNonBlankC(dob, "dob", errorCollection);
		errorCollection = assertNonBlankC(address, "address", errorCollection);
		errorCollection = assertNonBlankC(suburb, "suburb", errorCollection);
		errorCollection = assertNonBlankC(postcode, "postcode", errorCollection);
	    errorCollection = assertNonBlankC(phone, "phone", errorCollection);
        errorCollection = assertNonBlankC(email, "email", errorCollection);

		if (errorCollection)
		{
            if (typeof callback !== 'undefined')
            {
                console.log('Notifying of an error via callback');
                callback(null, new ValidationError(errorCollection));
            }
            else
            {
                console.log('Notifying of an error by throwing an error');
			    throw new ValidationError(errorCollection);
            }
		}

        console.log('The player is valid');
	}
		
	this.Validate = function(teamname, firstname, surname, dob, address, suburb, postcode, phone, email)
	{
		Validate(teamname, firstname, surname, dob, address, suburb, postcode, phone, email);	
	}
	
	function assertNonBlankC(str, name, errorCollection)
	{
		if (isBlank(str))
		{
			if (errorCollection == null)
			{
				errorCollection = [""];
				errorCollection[0] = name + " is not present";
			}
			else
				errorCollection.push(name + " is not present");
		}
		return errorCollection;
	}
	
	function assertNonBlank(str, name)
	{
		if (isBlank(str))
		{
			throw new Error(name + " is not present");
		}
	}
		
	function isBlank(str) {
    	return (!str || /^\s*$/.test(str));
	}
	
	function ValidationError(errorCollection) {
    	this.name = "ValidationError";
    	this.Errors = errorCollection;
	}
	ValidationError.prototype = Error.prototype;
};