/// <reference path='../typings/tsd.d.ts' />

module EmailServices {

	export class MailSettings {

		public fromEmailAddress: string;
		public baseUrl: string;
		public mailServiceName: string;
		public mailServiceUserName: string;
		public mailServiceUserPassword: string;
		
		constructor(fromEmailAddress: string, baseUrl: string, mailServiceName?: string, mailServiceUserName?: string, mailServiceUserPassword?: string) {
			this.fromEmailAddress = fromEmailAddress;
			this.baseUrl = baseUrl;
			this.mailServiceName = mailServiceName;
			this.mailServiceUserName = mailServiceUserName;
			this.mailServiceUserPassword = mailServiceUserPassword;
		}
	}
	
	export class MailGunEmailVerifyService {
		private nodemailer: any;
		private transport: any;
		private fromEmailAddress: string;
		private baseUrl: string;

		constructor(nodemailer: any, transport: any, mailSettings: MailSettings) {
			this.nodemailer = nodemailer;
			this.transport = transport;
			this.fromEmailAddress = mailSettings.fromEmailAddress;
			this.baseUrl = mailSettings.baseUrl;
			if (mailSettings.mailServiceName) {
				this.nodemailer = require('nodemailer');
				this.transport = this.createTransport(mailSettings.mailServiceName, mailSettings.mailServiceUserName, mailSettings.mailServiceUserPassword);
			}
		}
		
		createTransport = (mailServiceName: string, mailServiceUserName: string, mailServiceUserPassword: string) => {
			this.transport = this.nodemailer.createTransport({ 
				 	service: mailServiceName, 
				 	auth: { 
						user: mailServiceUserName,
						pass: mailServiceUserPassword
				 	}
			});
		}
	    
	    send = (toEmail: string, token: string, callback: any) => {
	    
	    	var rawMailBody : string;
	    	
	        rawMailBody = 'Please use the following web address to validate your email.  Usually clicking on the link in your email program will take you to the validation web page.\r\n'
	                        + 'If that does not work try selecting the web address and copying and pasteing it into your favourite web browser.  We look forward to having you onboard.\r\n\r\n'
	                        + this.baseUrl + '?u=' + toEmail + ';t=' + token;

            // send mail with defined transport object
            this.transport.sendMail({
                	from: this.fromEmailAddress, 
	                to: toEmail, 
	                subject: 'Please verify your email address to complete registration on MyTeamZone', 
	                text: rawMailBody,
	                html: rawMailBody
            }, function(err, info) {
            	if (err)
            		callback(err);
            	else
                	callback(undefined, info.response);
            });

	    }
	    
	}
}
module.exports = EmailServices.MailGunEmailVerifyService;