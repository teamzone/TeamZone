module.exports = EmailVerifyService;

function EmailVerifyService() {

    this.send = function(email, callback) {
        console.log('Doing Nothing with email %s', email);
        callback();
    };
    
}