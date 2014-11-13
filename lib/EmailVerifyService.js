module.exports = EmailVerifyService;

function EmailVerifyService() {

    var messageArray = [];
    
    this.send = function(email, callback) {
        console.log('Send email simulation');
        messageArray.push(email);
        callback();
    };
    this.messageCount = function() {
        console.log('message counter = %s', messageArray.length);
        return messageArray.length;
    }

    this.resetCount = function() {
        messageArray = [];
    };
}