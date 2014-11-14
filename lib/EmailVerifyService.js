module.exports = EmailVerifyService;

function EmailVerifyService() {

    var messageArray = [];
    
    this.send = function(email, callback) {
        console.log('Send email simulation');
        messageArray[messageArray.length + 1] = email;
        callback();
    };
    
    //TODO: How to get this out??
    function messageCount() {
        console.log('message counter = %s', messageArray.length);
        return messageArray.length;
    }

}