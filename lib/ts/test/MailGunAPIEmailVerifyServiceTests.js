/*jslint node: true */
/*jslint newcap: true */
/*global before, beforeEach, afterEach, after, describe, it, $$jsInject */
/*jslint nomen: true */
"use strict";

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.use(sinonChai);
var emailverifyservice = require('../MailGunAPIEmailVerifyService');
require('mocha-sinon');
require('string-format');
require('../../common/jsInject');
var Mailgun = require('mailgun').Mailgun;
var _ = require('underscore');

describe("MailGun Email Verify Service Unit Tests. Using MailGun API, a cloud based service for sending emails", function () {
    // 1/ Module Setup
    var sandbox,
        evs,
        spyCallback,
        email,
        token,
        fromEmailAddress,
        baseUrl,
        $jsInject,
        stubMailgunSendText,
        mailGunApiKey,
        rawMailBody;

    beforeEach(function () {

        email = 'john@mu.co.uk';
        token = 'UniqueToken';
        fromEmailAddress = 'registrations@myteamzone.com';
        baseUrl = 'http://www.teamzone.com/verifyReg';
        mailGunApiKey = 'RestfulAPIKeyForMailGun';

        //sandbox to cleanup global spies - test runner doesn't create new instance variables!
        sandbox = sinon.sandbox.create();

        //stub on nodemailer so we can observe what it does but not actually do it
        var mailgun = new Mailgun('somekey');
        stubMailgunSendText = sandbox.stub(mailgun, 'sendText');
        stubMailgunSendText.yields(undefined, { });
        //spy on the callback
        spyCallback = sandbox.spy();

        //will need to inject the nodemailer library so we can control it with the mocking library - we don't really want to send emails
        $jsInject = new $$jsInject();
        $jsInject.register("EmailVerifyService", ["fromEmailAddress", "baseUrl", "mailGunApiKey", "mailgun", emailverifyservice]);
        $jsInject.register("fromEmailAddress", [function () { return fromEmailAddress; }]);
        $jsInject.register("baseUrl", [function () { return baseUrl; }]);
        $jsInject.register("mailGunApiKey", [function () { return mailGunApiKey; }]);
        $jsInject.register("mailgun", [function () { return mailgun; }]);

        evs = $jsInject.get("EmailVerifyService");

        rawMailBody = "{0}\r\n\r\n{1}\r\n\r\n{2}"
            .format(
                'Please use the following web address to validate your email.  Usually clicking on the link in your email program will take you to the validation web page.',
                'If that does not work try selecting the web address and copying and pasteing it into your favourite web browser.  We look forward to having you onboard.',
                "{0}?u={1}&t={2}".format(baseUrl, email, encodeURIComponent(token))
            );
    });

    function assertFormattedEmailWasSent() {
        stubMailgunSendText.should.have.been.calledWith(fromEmailAddress, [email], 'Please verify your email address to complete registration on TeamZone',
            rawMailBody, 'noreply@aboutagile.com', {});
        spyCallback.should.not.have.been.calledWith(sinon.match.instanceOf(Error));
    }

    function assertMailerErrorReported(error) {
        spyCallback.should.have.been.calledWith(error);
    }

    // 2. Module Exercise

    it('The embedded token in the URI is encoded for special characters', function (done) {
        // 1. Setup

        // 2. Exercise
        evs.send(email, '+$', spyCallback);

        // 3. Verify
        evs.URI.substring(evs.URI.length - 6).should.equal('%2B%24');

        // 4. Cleanup 
        done();
    });

    it('Sends the verification email', function (done) {
        // 1. Setup

        // 2. Exercise
        evs.send(email, token, spyCallback);

        // 3. Verify
        assertFormattedEmailWasSent();

        // 4. Cleanup
        done();
    });

    it('Reports an error on mailer failure', function (done) {
        // 1. Setup
        var generalError = new Error('General Mailer Failure');
        stubMailgunSendText.yields(generalError);

        // 2. Exercise
        evs.send(email, token, spyCallback);

        // 3. Verify
        assertMailerErrorReported(generalError);

        // 4. Cleanup
        done();
    });

    it('Constructs mailgun object on missing mailgun parameter', function (done) {
        //1. Setup by recreating the injection
        evs = null;
        $jsInject = new $$jsInject();
        $jsInject.register("EmailVerifyService", ["fromEmailAddress", "baseUrl", "mailGunApiKey", "mailgun", emailverifyservice]);
        $jsInject.register("fromEmailAddress", [function () { return fromEmailAddress; }]);
        $jsInject.register("baseUrl", [function () { return baseUrl; }]);
        $jsInject.register("mailGunApiKey", [function () { return mailGunApiKey; }]);
        $jsInject.register("mailgun", [function () { return undefined; }]);

        //guarding that mailgun is actually undefined
        assert.isTrue(_.isEmpty($jsInject.get("mailgun")));

        //2. Exercise by construction
        evs = $jsInject.get("EmailVerifyService");

        //3. Verify by checking a purpose built property
        expect(evs.mailGun).to.be.an.instanceOf(Mailgun);

        //4. Cleanup
        done();
    });

    // 3. Module Verify

    // 4. Module Cleanup
    afterEach(function () {
        sandbox.restore();
    });

});