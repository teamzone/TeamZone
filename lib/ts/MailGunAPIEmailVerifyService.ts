/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../../typings/underscore.d.ts' />
/*jslint nomen: true */
'use strict';

import email = require('./IEmailVerifyService');
import _ = require('underscore');

var logger = require("../../utils/logger");
var Mailgun = require('mailgun').Mailgun;

/*
*  Integrates with MailGun Restful API to send a verification email to a new registrant.
*  @class
**/
export class MailGunAPIEmailVerifyService implements email.IEmailVerifyService {
	
	private uri: string;
	
	/**
	* Accepts the key parts to enable sending of the verification email.  
	* @constructor
	* @param {string} fromEmailAddress - the email that the sender receives the verificatione email from. Expects a validated email address, no validation provided.
	* @param {string} baseUrl - the base url to be included in the email body that the user can click on
	* @param {string} mailGunApiKey - a key to be use with the mail gin rest api
	* @param {mailgun} mailGun - Optional can pass in the mailgun object especially for providing stubs for unit testing.
	**/
	constructor(private fromEmailAddress: string, private baseUrl: string, private mailGunApiKey: string, private mailgun?: any) {
		// this.fromEmailAddress = fromEmailAddress;
		// this.baseUrl = baseUrl;
		// this.mailGunApiKey = mailGunApiKey;
		if (!_.isEmpty(mailgun))
			this.mailgun = mailgun;
		else 
			this.mailgun = new Mailgun(mailGunApiKey);
	}
	
	/**
	* Accepts the key parts to enable sending of the verification email.  
	* @param {string} toEmail - the receipient of the verification email. Expects a validated email address, no validation provided.
	* @param {string} token - unique code for the new registrant to help prevent spoofing
	**/	
    send = (toEmail: string, token: string, callback: any) => {
    
    	var rawMailBody: string;
    	
  		this.uri = this.baseUrl + '?u=' + toEmail + '&t=' + encodeURIComponent(token);
    	
        rawMailBody = 'Please use the following web address to validate your email.  Usually clicking on the link in your email program will take you to the validation web page.\r\n\r\n'
                        + 'If that does not work try selecting the web address and copying and pasteing it into your favourite web browser.  We look forward to having you onboard.\r\n\r\n'
                        + this.uri;

        this.mailgun.sendText(this.fromEmailAddress, [toEmail], 
        	'Please verify your email address to complete registration on TeamZone',
  			rawMailBody, 'noreply@aboutagile.com', {}, 
  			function(err, result) {
            	if (err) 
            		callback(err);
            	else 
            		callback(); 
			});

    }
  
	/**
	* Returns the full URI used during the send operation - used in the tests to verify the URI
	**/	  
  	get URI(): string {
  		return this.uri;
  	}
  	
	/**
	* Returns the mailGun object so tests can verify the operation of the send operation
	**/	  
  	get mailGun(): any {
  		return this.mailgun;
  	}
  	
}

module.exports = MailGunAPIEmailVerifyService;