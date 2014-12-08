/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/// <reference path="../lib/UserManagementService.ts" />
var Flash = (function () {
    function Flash() {
    }
    return Flash;
})();
var User = (function () {
    function User(ums) {
        var _this = this;
        /*
        * POST Login user.
        */
        this.post = function (req, res) {
            var flash = new Flash();
            // pull the form variables off the request body
            var username = req.body.username;
            var password = req.body.password;
            _this.ums.LoginUser(username, password, function (err, reslogin) {
                if (err) {
                    flash.type = 'alert-danger';
                    flash.messages = [{ msg: err.message }];
                    res.render('login', { flash: flash });
                }
                else {
                    if (reslogin.loggedIn) {
                        req.session.authenticated = true;
                        res.redirect('dashboard');
                    }
                    else {
                        flash.type = 'alert-info';
                        flash.messages = [{ msg: 'Login failed.  You may need to still verify your account or incorrect username/password was entered' }];
                        res.render('login', { flash: flash });
                    }
                }
            });
        };
        /*
         * GET login page.
         */
        this.get = function (req, res) {
            res.render('login');
        };
        this.ums = ums;
    }
    return User;
})();
exports.User = User;
module.exports = User;
