var Flash = (function () {
    function Flash() {
    }
    return Flash;
})();
var User = (function () {
    function User(ums) {
        /*
        * POST Login user.
        */
        this.Login = function (req, res) {
            var flash = new Flash();
            // pull the form variables off the request body
            var username = req.body.username;
            var password = req.body.password;
            ums.LoginUser(username, password, function (err, reslogin) {
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
        this.ums = ums;
    }
    return User;
})();
exports.User = User;
module.exports = User;
//# sourceMappingURL=user.js.map