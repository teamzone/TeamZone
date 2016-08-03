'use strict';
var Flash = require("./flash");
var _ = require('underscore');
var UserConfirm = (function () {
    function UserConfirm(_ums) {
        var _this = this;
        this._ums = _ums;
        this.post = function (req, res) {
            throw new Error('Post is not permitted for confirmation');
        };
        this.get = function (req, res) {
            var flash = new Flash();
            var email = req.query.u;
            var token = req.query.t;
            if (_.isUndefined(email) || _.isUndefined(token)) {
                flash.type = 'alert-danger';
                flash.messages = [{ msg: 'Invalid confirmation url' }];
                req.session.userConfirmation = flash;
                res.redirect('/login');
                return;
            }
            _this._ums.ConfirmRegisterUser(email, token, function (err, reslogin) {
                if (err) {
                    flash.type = 'alert-danger';
                    flash.messages = [{ msg: err.message }];
                    req.session.userConfirmation = flash;
                    res.redirect('/login');
                }
                else {
                    flash.type = 'alert-success';
                    flash.messages = [{ msg: 'You have been successfully confirmed, please log in.' }];
                    req.session.userConfirmation = flash;
                    res.redirect('/login');
                }
            });
        };
    }
    return UserConfirm;
}());
exports.UserConfirm = UserConfirm;
module.exports = UserConfirm;
//# sourceMappingURL=userConfirm.js.map