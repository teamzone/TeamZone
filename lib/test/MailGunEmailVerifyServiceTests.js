var assert = require('assert'); 
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;
chai.should();
chai.use(sinonChai);
var emailverifyservice = require('../MailGunEmailVerifyService');
var nodemailer = require('nodemailer');
var createError = require('errno').create;
require('mocha-sinon');
require('string-format');

describe("MailGun Email Verify Service Unit Tests. Using MailGun and NodeMailer, a cloud based service for sending emails", function() {

  var sandbox;
  var evs;
  var stubTransport;
  var spyCallback;
  var expectedMailerResponse;
  var mailMessage;
  var email;
  var token;
  var fromEmailAddress;
  var baseUrl;
  
  beforeEach(function()  {

      email = 'john@mu.co.uk';
      token = 'UniqueToken';
      fromEmailAddress = 'registrations@myteamzone.com';
      baseUrl = 'http://www.myteamzone.com/verifyReg';
      
      //sandbox to cleanup global spies - test runner doesn't create new instance variables!
      sandbox = sinon.sandbox.create();
 
      //stub on nodemailer so we can observe what it does but not actually do it
      var transport = nodemailer.createTransport({});
      stubTransport = sandbox.stub(transport, 'sendMail');
      expectedMailerResponse = { response: 'Mail was sent' };
      stubTransport.yields(undefined, expectedMailerResponse);
      
      //spy on the callback
      spyCallback = sandbox.spy();

      //will need to inject the nodemailer library so we can control it with the mocking library - we don't really want to send emails
      evs = new emailverifyservice(nodemailer, transport, fromEmailAddress, baseUrl);
      
      var rawMailBody = "{0}\r\n{1}\r\n\r\n{2}"
                            .format(
                                'Please use the following web address to validate your email.  Usually clicking on the link in your email program will take you to the validation web page.',
                                'If that does not work try selecting the web address and copying and pasteing it into your favourite web browser.  We look forward to having you onboard.',
                                "{0}?u={1};t={2}".format(baseUrl, email, token));
      
      mailMessage = {
        email: email,
        fromEmailAddress: 'registrations@myteamzone.com',
        subjectHeading: 'Please verify your email address to complete registration on MyTeamZone',
        text: rawMailBody,
        html: rawMailBody
      };
      
  });

  afterEach(function()  {
    sandbox.restore();
  })
  
  it('Sends the verification email', function(done) {
    evs.send(email, token, spyCallback);
    assertFormattedEmailWasSent();
    done();
  });

  it('Reports an error on mailer failure', function(done) {
    var generalError = new Error('General Mailer Failure');
    stubTransport.yields(generalError);
    evs.send(email, token, spyCallback);
    assertMailerErrorReported(generalError);
    done();
  });

  it("Can create the transport via a create method as the class should now how to do this - we think it is it's responsibility", function(done) {
    
    var stubCreateTransport = sandbox.stub(nodemailer, 'createTransport');
    var mailServiceName = 'mailgun';
    var mailServiceUserName = 'mail.gun@mailgun.org';
    var mailServiceUserPassword = 'passwordForMailGun';
    
    evs.createTransport(mailServiceName, mailServiceUserName, mailServiceUserPassword);
    
    stubCreateTransport.should.have.been.calledWith(
                  sinon.match({ service: mailServiceName,
                                auth: {
                                    user: mailServiceUserName, 
                                    pass: mailServiceUserPassword
                                }
                              }));

    done();
  });
  
  function assertFormattedEmailWasSent()  {
      stubTransport.should.have.been.calledWith(
                sinon.match({ 
                    from: fromEmailAddress,
                    to: email,
                    subject: mailMessage.subjectHeading,
                    text: mailMessage.text,
                    html: mailMessage.html
                }));
      spyCallback.should.have.been.calledWith(undefined, expectedMailerResponse.response);
  }
  
  function assertMailerErrorReported(error) {
    spyCallback.should.have.been.calledWith(error);
  }
});