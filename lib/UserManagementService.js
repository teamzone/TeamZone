/// <reference path='../typings/tsd.d.ts' />
var UserManagementService = (function () {
    function UserManagementService(users, crypt, tokenizer, emailsender) {
        this.LoginUser = function (name, password, callback) {
            //var crypt = this.crypt;
            users.get(name, function (err, value) {
                if (err) {
                    callback(err);
                }
                else {
                    if (!value.confirmed)
                        callback(new Error('User has yet to be confirmed'));
                    else {
                        crypt.compare(password, value.password, function (err, res) {
                            if (err)
                                callback(err);
                            else if (res)
                                callback(undefined, { firstname: value.firstname, surname: value.surname, email: name, loggedIn: true });
                            else
                                callback(new Error('Incorrect Login Details Entered, please check your email and/or password'));
                        });
                    }
                }
            });
        };
        this.RegisterUser = function (email, password, callback) {
            users.get(email, function (err, value) {
                if (err && err.notFound) {
                    crypt.hash(password, 10, function (err, hash) {
                        if (err)
                            callback(err);
                        else {
                            users.put(email, { password: hash, email: email, token: tokenizer.generate(email) }, function (err) {
                                if (err)
                                    callback(err);
                                else {
                                    emailsender.send(email, function (err) {
                                        if (err)
                                            callback(new Error('Failed to send the verification email'));
                                        else
                                            callback();
                                    });
                                }
                            });
                        }
                    });
                }
                else if (err) {
                    callback(err);
                }
                else {
                    callback(new Error("User already exists"));
                }
            });
        };
        this.ConfirmRegisterUser = function (email, token, callback) {
            users.get(email, function (err, value) {
                if (err && err.notFound)
                    callback(new Error('The user ' + email + ' is not present in the database'));
                else if (err)
                    callback(new Error('A failure occurred trying to retrieve details for ' + email));
                else if (tokenizer.verify(email, token)) {
                    users.put(email, { password: value.password, email: email, token: token, confirmed: true }, function (err) {
                        if (err)
                            callback(new Error('A failure occurred trying to save confirmation for ' + email));
                        else
                            callback();
                    });
                }
            });
        };
        this.users = users;
        this.crypt = crypt;
        this.tokenizer = tokenizer;
        this.emailsender = emailsender;
    }
    return UserManagementService;
})();
exports.UserManagementService = UserManagementService;
module.exports = UserManagementService;
//# sourceMappingURL=UserManagementService.js.map