/// <reference path='../typings/tsd.d.ts' />
var EmailServices;
(function (EmailServices) {
    var MailSettings = (function () {
        function MailSettings(fromEmailAddress, baseUrl, mailServiceName, mailServiceUserName, mailServiceUserPassword) {
            this.fromEmailAddress = fromEmailAddress;
            this.baseUrl = baseUrl;
            this.mailServiceName = mailServiceName;
            this.mailServiceUserName = mailServiceUserName;
            this.mailServiceUserPassword = mailServiceUserPassword;
        }
        return MailSettings;
    })();
    EmailServices.MailSettings = MailSettings;

    var MailGunEmailVerifyService = (function () {
        function MailGunEmailVerifyService(nodemailer, transport, mailSettings) {
            var _this = this;
            this.createTransport = function (mailServiceName, mailServiceUserName, mailServiceUserPassword) {
                _this.transport = _this.nodemailer.createTransport({
                    service: mailServiceName,
                    auth: {
                        user: mailServiceUserName,
                        pass: mailServiceUserPassword
                    }
                });
            };
            this.send = function (toEmail, token, callback) {
                var rawMailBody;

                rawMailBody = 'Please use the following web address to validate your email.  Usually clicking on the link in your email program will take you to the validation web page.\r\n' + 'If that does not work try selecting the web address and copying and pasteing it into your favourite web browser.  We look forward to having you onboard.\r\n\r\n' + _this.baseUrl + '?u=' + toEmail + ';t=' + token;

                // send mail with defined transport object
                _this.transport.sendMail({
                    from: _this.fromEmailAddress,
                    to: toEmail,
                    subject: 'Please verify your email address to complete registration on MyTeamZone',
                    text: rawMailBody,
                    html: rawMailBody
                }, function (err, info) {
                    if (err)
                        callback(err);
                    else
                        callback(undefined, info.response);
                });
            };
            this.nodemailer = nodemailer;
            this.transport = transport;
            this.fromEmailAddress = mailSettings.fromEmailAddress;
            this.baseUrl = mailSettings.baseUrl;
            if (mailSettings.mailServiceName) {
                this.nodemailer = require('nodemailer');
                this.transport = this.createTransport(mailSettings.mailServiceName, mailSettings.mailServiceUserName, mailSettings.mailServiceUserPassword);
            }
        }
        return MailGunEmailVerifyService;
    })();
    EmailServices.MailGunEmailVerifyService = MailGunEmailVerifyService;
})(EmailServices || (EmailServices = {}));
module.exports = EmailServices.MailGunEmailVerifyService;
//# sourceMappingURL=MailGunEmailVerifyService.js.map
