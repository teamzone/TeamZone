/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/express-session/express-session.d.ts' />
/// <reference path='../typings/node/node.d.ts' />
/// <reference path="../lib/UserManagementService.ts" />
var Flash = require("./flash");

/*
*  Handles web requests to login a user
*  @class
**/
var UserLogin = (function () {
    /**
    * Accepts the service component that will handle the registration of a new user in the database
    * @constructor
    * @param {IUserManagementService} _ums - service to provide the ability to register the new user.
    **/
    function UserLogin(_ums) {
        var _this = this;
        this._ums = _ums;
        /**
        * We attempt to login the user via the service.  No special validation required, the service will match the user and fail the
        * login process if this fails.
        * @param {express.Request} req - incoming request object furnished by Express
        * @param {express.Response} req - incoming response object furnished by Express
        **/
        this.post = function (req, res) {
            var flash = new Flash();

            // pull the form variables off the request body
            var username = req.body.username;
            var password = req.body.password;

            _this._ums.LoginUser(username, password, function (err, reslogin) {
                if (err) {
                    flash.type = 'alert-danger';
                    flash.messages = [{ msg: err.message }];
                    res.render('login', { flash: flash });
                } else {
                    if (reslogin.loggedIn) {
                        req.session.authenticated = true;
                        req.session.user = { email: username };
                        res.redirect('dashboard');
                    } else {
                        flash.type = 'alert-info';
                        flash.messages = [{ msg: 'Login failed.  You may need to still verify your account or incorrect username/password was entered' }];
                        res.render('login', { flash: flash });
                    }
                }
            });
        };
        /**
        * Renders the login page when requested by a user
        * @constructor
        * @param {express.Request} req - incoming request object furnished by Express
        * @param {express.Response} req - incoming response object furnished by Express
        **/
        this.get = function (req, res) {
            res.render('login');
        };
    }
    return UserLogin;
})();
exports.UserLogin = UserLogin;

module.exports = UserLogin;
//# sourceMappingURL=userLogin.js.map
