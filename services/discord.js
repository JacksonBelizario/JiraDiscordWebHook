module.exports = {
    hookId: '',
    hookToken: '',
    userName: '',
    avatarUrl: '',
    sendMessage: function(content) {
        this.send({content});
    },
    send: function(body) {
        var request = require('request');

        const newBody = {
            'username':this.userName,
            'avatar_url':this.avatarUrl,
            ...body
        };

        request({
            method: 'POST',
            url: `https://canary.discordapp.com/api/webhooks/${this.hookId}/${this.hookToken}`,
            headers: { 'Content-Type': 'application/json' },
            body: newBody,
            json: true
        }, function(error, response, body) {
            if (error) {
                console.log('===============================')
                console.log('Request err: ', error)
                throw new Error(error);
            }
            // console.log(body);
        });
    }
};