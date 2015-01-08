/// <reference path='../typings/tsd.d.ts' />
import email = require('./IEmailVerifyService');

export class EmailVerifyService implements email.IEmailVerifyService {

    private messageArray = [];

	constructor() {
	}
	
    send = (toEmail: string, token: string, callback: any) => {
        console.log('Send email simulation');
        this.messageArray.push(email);
        callback();
    }
  
  	get messageCount(): number {
  		return this.messageArray.length;
  	}
  	
  	resetCount = () => {
  	    this.messageArray = [];
  	}
}

module.exports = EmailVerifyService;
