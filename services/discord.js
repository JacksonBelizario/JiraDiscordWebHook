module.exports = {
    hookId: '',
    hookToken: '',
    userName: '',
    avatarUrl: '',
    sendMessage: function(content) {
        this.send({content});
    },
    send: function(body) {
        const querystring = require('querystring');
        const https = require('https');

        const data = {
            'username':this.userName,
            'avatar_url':this.avatarUrl,
            ...body
        };

        const postBody = querystring.stringify(data);

        const postreq = https.request({
            hostname: 'canary.discordapp.com',
            port: 443,
            path: `/api/webhooks/${this.hookId}/${this.hookToken}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postBody.length
            }
        });

        postreq.write(postBody);
        postreq.end();
    }
};